import 'package:flutter/material.dart';

class CustomTextTheme {
  static CustomTextTheme? _instance;
  static CustomTextTheme get customTextTheme => _instance ??= CustomTextTheme._init();

  CustomTextTheme._init();

  TextTheme get textTheme => const TextTheme(
    displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
    displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
    displaySmall: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
    headlineLarge: TextStyle(fontSize: 22, fontWeight: FontWeight.w600),
    headlineMedium: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
    headlineSmall: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
    titleLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
    titleMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
    titleSmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
    bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.normal),
    bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.normal),
    bodySmall: TextStyle(fontSize: 12, fontWeight: FontWeight.normal),
    labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
    labelMedium: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
    labelSmall: TextStyle(fontSize: 10, fontWeight: FontWeight.w500),
  );
}
