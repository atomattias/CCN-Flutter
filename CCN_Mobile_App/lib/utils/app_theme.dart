import 'package:flutter/material.dart';

class AppTheme {
  static AppTheme? _instance;
  static AppTheme get appTheme => _instance ??= AppTheme._init();

  AppTheme._init();

  Color get primary => const Color(0xFF1E88E5);
  Color get secondary => const Color(0xFF42A5F5);
  Color get accent => const Color(0xFF64B5F6);
  Color get background => const Color(0xFFF5F5F5);
  Color get surface => Colors.white;
  Color get error => const Color(0xFFD32F2F);
  Color get success => const Color(0xFF388E3C);
  Color get warning => const Color(0xFFFFA000);
  Color get info => const Color(0xFF1976D2);
  Color get danger => const Color(0xFFD32F2F);
}
