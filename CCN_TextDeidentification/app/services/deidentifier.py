"""
Text De-identification Service
Comprehensive PHI detection and de-identification for clinical text
"""

import re
import logging
import hashlib
import asyncio
from typing import List, Dict, Any, Optional, Tuple, AsyncIterator
from datetime import datetime
from functools import lru_cache
import spacy
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
import phonenumbers
from email_validator import validate_email, EmailNotValidError
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.chunk import ne_chunk
from nltk.tag import pos_tag
import json

logger = logging.getLogger(__name__)

class TextDeidentifier:
    """
    Comprehensive text de-identification service for clinical data
    
    Supports multiple methods:
    - regex: Pattern-based detection
    - nlp: Natural Language Processing
    - comprehensive: Combined approach
    - hybrid: Advanced context-aware processing
    """
    
    def __init__(self):
        self.is_loaded = False
        self.nlp_model = None
        self.analyzer_engine = None
        self.anonymizer_engine = None
        self.phi_patterns = {}
        self.medical_terms = set()
        self._cache = {}  # Simple in-memory cache
        self._cache_max_size = 1000
        
    async def initialize(self):
        """Initialize the de-identification service"""
        try:
            logger.info("Initializing Text De-identifier...")
            
            # Download required NLTK data
            self._download_nltk_data()
            
            # Load spaCy model
            try:
                self.nlp_model = spacy.load("en_core_web_sm")
                logger.info("✅ spaCy model loaded successfully")
            except OSError:
                logger.warning("spaCy model not found, using basic NLP")
                self.nlp_model = None
            
            # Initialize Presidio engines
            try:
                self.analyzer_engine = AnalyzerEngine()
                self.anonymizer_engine = AnonymizerEngine()
                logger.info("✅ Presidio engines initialized successfully")
            except Exception as e:
                logger.warning(f"Presidio engines not available: {e}")
                self.analyzer_engine = None
                self.anonymizer_engine = None
            
            # Load PHI patterns
            self._load_phi_patterns()
            
            # Load medical terms
            self._load_medical_terms()
            
            self.is_loaded = True
            logger.info("✅ Text De-identifier initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Text De-identifier: {e}")
            raise
    
    def _download_nltk_data(self):
        """Download required NLTK data"""
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('averaged_perceptron_tagger', quiet=True)
            nltk.download('maxent_ne_chunker', quiet=True)
            nltk.download('words', quiet=True)
            logger.info("✅ NLTK data downloaded successfully")
        except Exception as e:
            logger.warning(f"NLTK data download failed: {e}")
    
    def _load_phi_patterns(self):
        """Load comprehensive PHI detection patterns"""
        self.phi_patterns = {
            # Names (various formats) - More precise patterns
            'names': [
                r'\b[A-Z][a-z]+ [A-Z][a-z]+\b',  # First Last
                r'\b[A-Z][a-z]+, [A-Z][a-z]+\b',  # Last, First
                r'\bDr\. [A-Z][a-z]+\b',  # Dr. Name
                r'\bMr\. [A-Z][a-z]+\b',  # Mr. Name
                r'\bMs\. [A-Z][a-z]+\b',  # Ms. Name
                r'\bMrs\. [A-Z][a-z]+\b',  # Mrs. Name
            ],
            
            # Dates (various formats)
            'dates': [
                r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',  # MM/DD/YYYY
                r'\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b',  # YYYY/MM/DD
                r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b',  # Month DD, YYYY
                r'\b\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b',  # DD Month YYYY
            ],
            
            # IDs and Numbers
            'ids': [
                r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
                r'\b\d{3}\.\d{2}\.\d{4}\b',  # SSN with dots
                r'\b\d{9}\b',  # 9-digit number (potential SSN)
                r'\b[A-Z]{2}\d{6}\b',  # State ID format
                r'\b\d{4}-\d{4}-\d{4}-\d{4}\b',  # Credit card
                r'\bMRN:?\s*\d+\b',  # Medical Record Number
                r'\bPatient ID:?\s*\d+\b',  # Patient ID
            ],
            
            # Phone Numbers
            'phones': [
                r'\b\d{3}-\d{3}-\d{4}\b',  # XXX-XXX-XXXX
                r'\b\(\d{3}\)\s*\d{3}-\d{4}\b',  # (XXX) XXX-XXXX
                r'\b\d{3}\.\d{3}\.\d{4}\b',  # XXX.XXX.XXXX
                r'\b\d{10}\b',  # 10-digit number
            ],
            
            # Email Addresses
            'emails': [
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            ],
            
            # Addresses
            'addresses': [
                r'\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b',
                r'\b\d{5}(?:-\d{4})?\b',  # ZIP codes
            ],
            
            # Medical-specific PHI
            'medical_phi': [
                r'\bDOB:?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',  # Date of Birth
                r'\bAge:?\s*\d+\b',  # Age
                r'\bWeight:?\s*\d+\s*(?:lbs?|kg)\b',  # Weight
                r'\bHeight:?\s*\d+\s*(?:ft|feet|in|inches|cm)\b',  # Height
                r'\bInsurance:?\s*[A-Za-z0-9\s]+\b',  # Insurance
                r'\bPolicy:?\s*[A-Za-z0-9\s]+\b',  # Policy number
            ],
            
            # Clinical identifiers
            'clinical_identifiers': [
                r'\b(?:patient|pt|subject)\s*#?\s*\d+\b',
                r'\b(?:case|study)\s*#?\s*[A-Z0-9-]+\b',
                r'\b(?:specimen|sample)\s*#?\s*\d+\b',
                r'\b(?:chart|record)\s*#?\s*[A-Z0-9-]+\b',
                r'\b(?:visit|encounter)\s*#?\s*\d+\b',
                r'\b(?:admission|discharge)\s*#?\s*\d+\b',
                r'\b(?:lab|test)\s*#?\s*[A-Z0-9-]+\b',
                r'\b(?:order|req)\s*#?\s*\d+\b'
            ],
            
            # Medical dates and times
            'medical_dates': [
                r'\b(?:admission|admit):?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
                r'\b(?:discharge|disch):?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
                r'\b(?:born|birth)\s+(?:on\s+)?\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
                r'\b(?:age|aged)\s+\d{1,3}\s*(?:years?|yrs?|months?|days?)\b',
                r'\b(?:procedure|surgery)\s+(?:on\s+)?\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b'
            ],
            
            # Location-based PHI
            'location_phi': [
                r'\b(?:room|bed)\s*#?\s*\d+[A-Z]?\b',
                r'\b(?:floor|level)\s*\d+\b',
                r'\b(?:unit|ward)\s*[A-Z0-9]+\b',
                r'\b(?:department|dept)\s*[A-Z0-9]+\b',
                r'\b(?:clinic|center|facility)\s*[A-Z0-9]+\b',
                r'\b(?:building|bldg)\s*[A-Z0-9]+\b'
            ],
            
            # Insurance and financial info
            'insurance_info': [
                r'\b(?:insurance|ins)\s*#?\s*[A-Z0-9-]+\b',
                r'\b(?:policy|member)\s*#?\s*[A-Z0-9-]+\b',
                r'\b(?:group|plan)\s*#?\s*[A-Z0-9-]+\b',
                r'\b[A-Z]{2,4}\d{6,12}\b',  # Insurance ID patterns
                r'\b(?:copay|deductible):?\s*\$\d+(?:\.\d{2})?\b'
            ],
            
            # Medical measurements and vitals
            'medical_measurements': [
                r'\b(?:weight|wt):?\s*\d+(?:\.\d+)?\s*(?:lbs?|kg|pounds?|kilograms?)\b',
                r'\b(?:height|ht):?\s*\d+(?:\.\d+)?\s*(?:ft|feet|in|inches|cm|meters?)\b',
                r'\b(?:BP|blood\s+pressure):?\s*\d+/\d+\b',
                r'\b(?:HR|heart\s+rate):?\s*\d+\s*(?:bpm|beats?/min)\b',
                r'\b(?:temp|temperature):?\s*\d+(?:\.\d+)?\s*(?:°?F|°?C|fahrenheit|celsius)\b',
                r'\b(?:RR|resp\s+rate):?\s*\d+\s*(?:/min|breaths?/min)\b',
                r'\b(?:O2|oxygen)\s+(?:sat|saturation):?\s*\d+%\b'
            ]
        }
        logger.info("✅ PHI patterns loaded successfully")
    
    def _load_medical_terms(self):
        """Load comprehensive medical terms to preserve during de-identification"""
        self.medical_terms = {
            # Common medical terms
            'symptoms', 'diagnosis', 'treatment', 'medication', 'allergy',
            'blood pressure', 'heart rate', 'temperature', 'pulse',
            'chest pain', 'headache', 'fever', 'nausea', 'vomiting',
            'diabetes', 'hypertension', 'asthma', 'pneumonia',
            'x-ray', 'ct scan', 'mri', 'ultrasound', 'lab results',
            'emergency', 'urgent', 'critical', 'stable', 'improving',
            
            # Cardiology
            'ecg', 'ekg', 'myocardial infarction', 'mi', 'cabg', 'stent',
            'angina', 'arrhythmia', 'tachycardia', 'bradycardia',
            'echocardiogram', 'stress test', 'catheterization',
            
            # Oncology
            'tumor', 'metastasis', 'chemotherapy', 'radiation', 'oncology',
            'carcinoma', 'sarcoma', 'lymphoma', 'leukemia', 'biopsy',
            'remission', 'prognosis', 'staging',
            
            # Neurology
            'seizure', 'epilepsy', 'stroke', 'tia', 'migraine',
            'alzheimer', 'parkinson', 'dementia', 'concussion',
            'eeg', 'lumbar puncture', 'neurological exam',
            
            # Orthopedics
            'fracture', 'dislocation', 'arthritis', 'osteoporosis',
            'joint replacement', 'arthroscopy', 'cast', 'splint',
            'physical therapy', 'rehabilitation',
            
            # Emergency Medicine
            'trauma', 'shock', 'hemorrhage', 'cardiac arrest',
            'cpr', 'defibrillation', 'intubation', 'ventilation',
            'triage', 'resuscitation',
            
            # Laboratory and Diagnostics
            'cbc', 'bmp', 'lft', 'troponin', 'bnp', 'creatinine',
            'glucose', 'hemoglobin', 'white blood cell', 'platelet',
            'culture', 'sensitivity', 'pathology', 'histology',
            
            # Medications and Treatments
            'antibiotic', 'analgesic', 'anticoagulant', 'insulin',
            'surgery', 'procedure', 'anesthesia', 'sedation',
            'intravenous', 'oral', 'topical', 'injection',
            
            # Medical Equipment
            'ventilator', 'monitor', 'defibrillator', 'pulse oximeter',
            'blood pressure cuff', 'stethoscope', 'thermometer',
            'wheelchair', 'crutches', 'walker'
        }
        logger.info("✅ Enhanced medical terms loaded successfully")
    
    async def deidentify_text(
        self,
        text: str,
        method: str = "comprehensive",
        sensitivity: str = "high",
        preserve_context: bool = True,
        custom_patterns: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        De-identify clinical text by removing PHI with caching support
        
        Args:
            text: Input text to de-identify
            method: De-identification method ("regex", "nlp", "comprehensive", "hybrid")
            sensitivity: Sensitivity level ("low", "medium", "high", "extreme")
            preserve_context: Whether to preserve medical context
            custom_patterns: Additional custom patterns to detect
            
        Returns:
            Dictionary with de-identified text and PHI detection results
        """
        if not self.is_loaded:
            raise Exception("Text deidentifier not initialized")
        
        # Check cache first
        text_hash = self._get_text_hash(text)
        cached_result = self._get_cached_result(text_hash, method, sensitivity)
        if cached_result:
            logger.debug(f"Cache hit for text hash: {text_hash[:8]}...")
            return cached_result
        
        try:
            # Detect PHI first
            phi_detected = await self.detect_phi(text, method, sensitivity, custom_patterns)
            
            # De-identify based on method
            if method == "regex":
                deidentified_text = self._deidentify_regex(text, phi_detected, preserve_context)
            elif method == "nlp":
                deidentified_text = self._deidentify_nlp(text, phi_detected, preserve_context)
            elif method == "comprehensive":
                deidentified_text = self._deidentify_comprehensive(text, phi_detected, preserve_context)
            elif method == "hybrid":
                deidentified_text = self._deidentify_hybrid(text, phi_detected, preserve_context)
            else:
                raise ValueError(f"Unknown de-identification method: {method}")
            
            # Calculate confidence score
            confidence_score = self._calculate_confidence(phi_detected, method)
            
            result = {
                'deidentified_text': deidentified_text,
                'phi_detected': phi_detected,
                'phi_count': len(phi_detected),
                'confidence_score': confidence_score
            }
            
            # Cache the result
            self._cache_result(text_hash, method, sensitivity, result)
            
            return result
            
        except Exception as e:
            logger.error(f"De-identification failed: {e}")
            raise
    
    async def detect_phi(
        self,
        text: str,
        method: str = "comprehensive",
        sensitivity: str = "high",
        custom_patterns: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Detect PHI in text without de-identifying
        
        Args:
            text: Input text to analyze
            method: Detection method
            sensitivity: Sensitivity level
            custom_patterns: Additional custom patterns
            
        Returns:
            List of detected PHI items
        """
        phi_detected = []
        
        try:
            # Use Presidio if available
            if self.analyzer_engine and method in ["nlp", "comprehensive", "hybrid"]:
                presidio_results = self.analyzer_engine.analyze(text=text, language='en')
                for result in presidio_results:
                    phi_detected.append({
                        'type': result.entity_type,
                        'value': text[result.start:result.end],
                        'start': result.start,
                        'end': result.end,
                        'confidence': result.score,
                        'context': self._get_context(text, result.start, result.end)
                    })
            
            # Add regex-based detection
            if method in ["regex", "comprehensive", "hybrid"]:
                regex_results = self._detect_phi_regex(text, sensitivity)
                phi_detected.extend(regex_results)
            
            # Add custom patterns
            if custom_patterns:
                custom_results = self._detect_custom_patterns(text, custom_patterns)
                phi_detected.extend(custom_results)
            
            # Remove duplicates and sort by position
            phi_detected = self._deduplicate_phi(phi_detected)
            phi_detected.sort(key=lambda x: x['start'])
            
            return phi_detected
            
        except Exception as e:
            logger.error(f"PHI detection failed: {e}")
            raise
    
    def _detect_phi_regex(self, text: str, sensitivity: str) -> List[Dict[str, Any]]:
        """Detect PHI using regex patterns"""
        phi_detected = []
        
        # Adjust patterns based on sensitivity
        patterns_to_use = self.phi_patterns.copy()
        if sensitivity == "low":
            patterns_to_use = {k: v for k, v in patterns_to_use.items() if k in ['names', 'dates', 'ids']}
        elif sensitivity == "extreme":
            # Add more aggressive patterns
            patterns_to_use['aggressive'] = [
                r'\b[A-Z][a-z]+\b',  # Any capitalized word
                r'\b\d+\b',  # Any number
            ]
        
        for phi_type, patterns in patterns_to_use.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    matched_text = match.group()
                    
                    # Skip if it's a medical term
                    if self._is_medical_term(matched_text):
                        continue
                    
                    # Skip if it's a common word (for names)
                    if phi_type == 'names' and self._is_common_word(matched_text):
                        continue
                    
                    # Skip if it contains common words (for multi-word patterns)
                    if phi_type == 'names' and any(self._is_common_word(word) for word in matched_text.split()):
                        continue
                    
                    phi_detected.append({
                        'type': phi_type,
                        'value': matched_text,
                        'start': match.start(),
                        'end': match.end(),
                        'confidence': 0.8,  # Default confidence for regex
                        'context': self._get_context(text, match.start(), match.end())
                    })
        
        return phi_detected
    
    def _detect_custom_patterns(self, text: str, patterns: List[str]) -> List[Dict[str, Any]]:
        """Detect PHI using custom patterns"""
        phi_detected = []
        
        for pattern in patterns:
            try:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    phi_detected.append({
                        'type': 'custom',
                        'value': match.group(),
                        'start': match.start(),
                        'end': match.end(),
                        'confidence': 0.7,
                        'context': self._get_context(text, match.start(), match.end())
                    })
            except re.error as e:
                logger.warning(f"Invalid custom pattern: {pattern}, error: {e}")
        
        return phi_detected
    
    def _deidentify_regex(self, text: str, phi_detected: List[Dict], preserve_context: bool) -> str:
        """De-identify using regex-based replacement"""
        deidentified_text = text
        
        # Sort by position (reverse order to maintain indices)
        phi_detected.sort(key=lambda x: x['start'], reverse=True)
        
        for phi in phi_detected:
            replacement = self._get_replacement(phi['type'], phi['value'], preserve_context)
            deidentified_text = (
                deidentified_text[:phi['start']] + 
                replacement + 
                deidentified_text[phi['end']:]
            )
        
        return deidentified_text
    
    def _deidentify_nlp(self, text: str, phi_detected: List[Dict], preserve_context: bool) -> str:
        """De-identify using NLP-based approach"""
        if not self.nlp_model:
            return self._deidentify_regex(text, phi_detected, preserve_context)
        
        # Use spaCy for more sophisticated processing
        doc = self.nlp_model(text)
        deidentified_text = text
        
        # Process named entities
        for ent in doc.ents:
            if ent.label_ in ['PERSON', 'DATE', 'GPE', 'ORG']:
                replacement = self._get_replacement(ent.label_, ent.text, preserve_context)
                deidentified_text = deidentified_text.replace(ent.text, replacement)
        
        return deidentified_text
    
    def _deidentify_comprehensive(self, text: str, phi_detected: List[Dict], preserve_context: bool) -> str:
        """De-identify using comprehensive approach (regex + NLP)"""
        # Start with NLP-based de-identification
        deidentified_text = self._deidentify_nlp(text, phi_detected, preserve_context)
        
        # Apply regex-based de-identification for remaining PHI
        remaining_phi = self._detect_phi_regex(deidentified_text, "high")
        deidentified_text = self._deidentify_regex(deidentified_text, remaining_phi, preserve_context)
        
        return deidentified_text
    
    def _deidentify_hybrid(self, text: str, phi_detected: List[Dict], preserve_context: bool) -> str:
        """De-identify using hybrid approach with context preservation"""
        # Use Presidio anonymizer if available
        if self.anonymizer_engine and self.analyzer_engine:
            try:
                analyzer_results = self.analyzer_engine.analyze(text=text, language='en')
                anonymized_result = self.anonymizer_engine.anonymize(
                    text=text,
                    analyzer_results=analyzer_results
                )
                return anonymized_result.text
            except Exception as e:
                logger.warning(f"Presidio anonymization failed: {e}")
        
        # Fallback to comprehensive approach
        return self._deidentify_comprehensive(text, phi_detected, preserve_context)
    
    def _get_replacement(self, phi_type: str, value: str, preserve_context: bool) -> str:
        """Get appropriate replacement for PHI based on type"""
        replacements = {
            'names': '[NAME]',
            'PERSON': '[NAME]',
            'dates': '[DATE]',
            'DATE': '[DATE]',
            'ids': '[ID NUMBER]',
            'phones': '[PHONE NUMBER]',
            'emails': '[EMAIL ADDRESS]',
            'addresses': '[ADDRESS]',
            'GPE': '[LOCATION]',
            'medical_phi': '[MEDICAL INFO]',
            'custom': '[REDACTED]'
        }
        
        if preserve_context:
            # More specific replacements for context preservation
            if 'DOB' in value or 'birth' in value.lower():
                return '[DATE OF BIRTH]'
            elif 'age' in value.lower():
                return '[AGE]'
            elif 'weight' in value.lower():
                return '[WEIGHT]'
            elif 'height' in value.lower():
                return '[HEIGHT]'
            elif 'insurance' in value.lower():
                return '[INSURANCE]'
        
        return replacements.get(phi_type, '[REDACTED]')
    
    def _get_context(self, text: str, start: int, end: int, context_length: int = 20) -> str:
        """Get context around detected PHI"""
        context_start = max(0, start - context_length)
        context_end = min(len(text), end + context_length)
        return text[context_start:context_end]
    
    def _is_medical_term(self, text: str) -> bool:
        """Check if text is a medical term that should be preserved"""
        return text.lower() in self.medical_terms
    
    def _is_common_word(self, text: str) -> bool:
        """Check if text is a common word that shouldn't be considered PHI"""
        common_words = {
            'and', 'or', 'with', 'of', 'in', 'at', 'on', 'for', 'to', 'from', 'by',
            'has', 'have', 'had', 'is', 'are', 'was', 'were', 'will', 'would', 'could',
            'should', 'may', 'might', 'can', 'must', 'shall', 'do', 'does', 'did',
            'get', 'got', 'go', 'went', 'come', 'came', 'see', 'saw', 'know', 'knew',
            'think', 'thought', 'say', 'said', 'tell', 'told', 'give', 'gave', 'take',
            'took', 'make', 'made', 'find', 'found', 'look', 'looked', 'feel', 'felt',
            'seem', 'seemed', 'become', 'became', 'leave', 'left', 'put', 'keep', 'kept',
            'let', 'begin', 'began', 'start', 'started', 'turn', 'turned', 'move', 'moved',
            'live', 'lived', 'work', 'worked', 'play', 'played', 'run', 'ran', 'walk',
            'walked', 'drive', 'drove', 'fly', 'flew', 'fall', 'fell', 'grow', 'grew',
            'bring', 'brought', 'buy', 'bought', 'sell', 'sold', 'pay', 'paid', 'cost',
            'spend', 'spent', 'build', 'built', 'break', 'broke', 'cut', 'hit', 'hurt',
            'catch', 'caught', 'throw', 'threw', 'hold', 'held', 'carry', 'carried',
            'push', 'pushed', 'pull', 'pulled', 'open', 'opened', 'close', 'closed',
            'stop', 'stopped', 'continue', 'continued', 'try', 'tried', 'use', 'used',
            'help', 'helped', 'show', 'showed', 'learn', 'learned', 'change', 'changed',
            'include', 'included', 'follow', 'followed', 'create', 'created', 'develop',
            'developed', 'provide', 'provided', 'require', 'required', 'allow', 'allowed',
            'support', 'supported', 'serve', 'served', 'appear', 'appeared', 'remain',
            'remained', 'increase', 'increased', 'decrease', 'decreased', 'improve',
            'improved', 'reduce', 'reduced', 'raise', 'raised', 'lower', 'lowered',
            'rise', 'rose', 'drop', 'dropped', 'gain', 'gained', 'lose', 'lost', 'win',
            'won', 'beat', 'fail', 'failed', 'succeed', 'succeeded', 'achieve', 'achieved',
            'reach', 'reached', 'arrive', 'arrived', 'return', 'returned', 'travel',
            'traveled', 'visit', 'visited', 'stay', 'stayed', 'wait', 'waited', 'expect',
            'expected', 'hope', 'hoped', 'wish', 'wished', 'dream', 'dreamed', 'imagine',
            'imagined', 'believe', 'believed', 'trust', 'trusted', 'doubt', 'doubted',
            'wonder', 'wondered', 'realize', 'realized', 'understand', 'understood',
            'remember', 'remembered', 'forget', 'forgot', 'recognize', 'recognized',
            'notice', 'noticed', 'observe', 'observed', 'watch', 'watched', 'listen',
            'listened', 'hear', 'heard', 'smell', 'smelled', 'taste', 'tasted', 'touch',
            'touched', 'sound', 'sounded', 'father', 'mother', 'brother', 'sister',
            'son', 'daughter', 'parent', 'child', 'family', 'friend', 'patient', 'doctor',
            'nurse', 'hospital', 'clinic', 'medical', 'health', 'care', 'treatment',
            'therapy', 'medicine', 'drug', 'medication', 'surgery', 'operation',
            'procedure', 'test', 'examination', 'diagnosis', 'condition', 'disease',
            'illness', 'symptom', 'pain', 'ache', 'fever', 'temperature', 'blood',
            'pressure', 'heart', 'lung', 'brain', 'head', 'chest', 'back', 'leg',
            'arm', 'hand', 'foot', 'eye', 'ear', 'nose', 'mouth', 'throat', 'stomach',
            'abdomen', 'liver', 'kidney', 'bone', 'muscle', 'skin', 'hair', 'tooth',
            'teeth', 'gum', 'tongue', 'lip', 'cheek', 'chin', 'forehead', 'neck',
            'shoulder', 'elbow', 'wrist', 'finger', 'thumb', 'nail', 'knee', 'ankle',
            'toe', 'heel', 'spine', 'rib', 'hip', 'waist', 'belly', 'chest', 'breast',
            'lung', 'heart', 'stomach', 'liver', 'kidney', 'bladder', 'intestine',
            'colon', 'rectum', 'anus', 'penis', 'vagina', 'testicle', 'ovary', 'uterus',
            'prostate', 'thyroid', 'adrenal', 'pancreas', 'spleen', 'gallbladder',
            'appendix', 'tonsil', 'lymph', 'vein', 'artery', 'nerve', 'tendon',
            'ligament', 'cartilage', 'joint', 'bone', 'marrow', 'plasma', 'cell',
            'tissue', 'organ', 'system', 'body', 'human', 'person', 'individual',
            'man', 'woman', 'boy', 'girl', 'baby', 'infant', 'child', 'teenager',
            'adult', 'elderly', 'senior', 'young', 'old', 'middle', 'aged'
        }
        return text.lower() in common_words
    
    def _deduplicate_phi(self, phi_detected: List[Dict]) -> List[Dict]:
        """Remove duplicate PHI detections"""
        seen = set()
        unique_phi = []
        
        for phi in phi_detected:
            key = (phi['start'], phi['end'], phi['type'])
            if key not in seen:
                seen.add(key)
                unique_phi.append(phi)
        
        return unique_phi
    
    def _calculate_confidence(self, phi_detected: List[Dict], method: str) -> float:
        """Calculate overall confidence score"""
        if not phi_detected:
            return 1.0
        
        # Base confidence by method
        method_confidence = {
            'regex': 0.7,
            'nlp': 0.8,
            'comprehensive': 0.9,
            'hybrid': 0.95
        }
        
        base_confidence = method_confidence.get(method, 0.8)
        
        # Adjust based on individual PHI confidence scores
        avg_phi_confidence = sum(phi['confidence'] for phi in phi_detected) / len(phi_detected)
        
        return (base_confidence + avg_phi_confidence) / 2
    
    def _get_text_hash(self, text: str) -> str:
        """Generate hash for text caching"""
        return hashlib.md5(text.encode()).hexdigest()
    
    def _get_cached_result(self, text_hash: str, method: str, sensitivity: str) -> Optional[Dict[str, Any]]:
        """Get cached de-identification result"""
        cache_key = f"{text_hash}_{method}_{sensitivity}"
        return self._cache.get(cache_key)
    
    def _cache_result(self, text_hash: str, method: str, sensitivity: str, result: Dict[str, Any]):
        """Cache de-identification result"""
        if len(self._cache) >= self._cache_max_size:
            # Remove oldest entries (simple FIFO)
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]
        
        cache_key = f"{text_hash}_{method}_{sensitivity}"
        self._cache[cache_key] = result
    
    async def deidentify_batch(
        self, 
        texts: List[str], 
        method: str = "comprehensive",
        sensitivity: str = "high",
        preserve_context: bool = True,
        custom_patterns: Optional[List[str]] = None,
        max_concurrent: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Process multiple texts concurrently for better performance
        
        Args:
            texts: List of texts to de-identify
            method: De-identification method
            sensitivity: Sensitivity level
            preserve_context: Whether to preserve medical context
            custom_patterns: Additional custom patterns
            max_concurrent: Maximum concurrent processing tasks
            
        Returns:
            List of de-identification results
        """
        if not self.is_loaded:
            raise Exception("Text deidentifier not initialized")
        
        # Create semaphore to limit concurrent processing
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def process_single_text(text: str) -> Dict[str, Any]:
            async with semaphore:
                return await self.deidentify_text(
                    text=text,
                    method=method,
                    sensitivity=sensitivity,
                    preserve_context=preserve_context,
                    custom_patterns=custom_patterns
                )
        
        # Process all texts concurrently
        tasks = [process_single_text(text) for text in texts]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle any exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Error processing text {i}: {result}")
                processed_results.append({
                    'error': str(result),
                    'original_text': texts[i],
                    'deidentified_text': texts[i],  # Return original on error
                    'phi_detected': [],
                    'phi_count': 0,
                    'confidence_score': 0.0
                })
            else:
                processed_results.append(result)
        
        return processed_results
    
    async def deidentify_stream(
        self, 
        text_stream: AsyncIterator[str],
        method: str = "comprehensive",
        sensitivity: str = "high",
        preserve_context: bool = True,
        custom_patterns: Optional[List[str]] = None
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Process text streams in real-time
        
        Args:
            text_stream: Async iterator of texts
            method: De-identification method
            sensitivity: Sensitivity level
            preserve_context: Whether to preserve medical context
            custom_patterns: Additional custom patterns
            
        Yields:
            De-identification results as they become available
        """
        if not self.is_loaded:
            raise Exception("Text deidentifier not initialized")
        
        async for text in text_stream:
            try:
                result = await self.deidentify_text(
                    text=text,
                    method=method,
                    sensitivity=sensitivity,
                    preserve_context=preserve_context,
                    custom_patterns=custom_patterns
                )
                yield result
            except Exception as e:
                logger.error(f"Error processing stream text: {e}")
                yield {
                    'error': str(e),
                    'original_text': text,
                    'deidentified_text': text,
                    'phi_detected': [],
                    'phi_count': 0,
                    'confidence_score': 0.0
                }
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            'cache_size': len(self._cache),
            'max_cache_size': self._cache_max_size,
            'cache_hit_ratio': getattr(self, '_cache_hits', 0) / max(getattr(self, '_cache_requests', 1), 1)
        }
    
    def clear_cache(self):
        """Clear the de-identification cache"""
        self._cache.clear()
        logger.info("Cache cleared")

