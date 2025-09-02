
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class AppTheme {
  Color primary;
  Color secondary;
  Color border;
  Color dark = const Color(0xff000000);
  Color light = const Color(0xffFFFFFF);
  Color success = const Color(0xff4caf50);
  Color danger = const Color(0xffff0e0e);

  AppTheme({
    required this.primary,
    required this.secondary,
    required this.border,
  });

  static AppTheme _dark() {
    return AppTheme(
      primary: const Color(0xff7171F1),
      secondary: const Color(0xffE7E7FD),
      border: const Color(0xff010138),
    );
  }

  static AppTheme _light() {
    return AppTheme(
      primary: const Color(0xff7171F1),
      secondary: const Color(0xffE7E7FD),
      border: const Color(0xff010138),
    );
  }

  static AppTheme appTheme(context) {
    final theme = CupertinoTheme.of(context).brightness;
    return (Brightness.dark == theme) ? _dark() : _light();
  }
}
