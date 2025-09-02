
import 'package:ccn_admin/theme/app_theme.dart';
import 'package:flutter/material.dart';

class CustomTextTheme {
  late TextTheme textTheme;

  static CustomTextTheme light(BuildContext context) {
    final appTheme = AppTheme.appTheme(context);
    return CustomTextTheme()
      ..textTheme = TextTheme(
          bodyLarge: TextStyle(
            color: appTheme.dark,
          ),
          bodyMedium: TextStyle(
            color: appTheme.dark,
            fontWeight: FontWeight.bold
          ),
          bodySmall: TextStyle(
            fontSize: 12,
            color: appTheme.dark.withOpacity(.5),
          ),
          labelLarge: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: appTheme.dark,
          ),
          labelMedium: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: appTheme.dark,
          ),
          labelSmall: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: appTheme.dark,
          ),
          headlineLarge: TextStyle(
            fontSize: 19,
            color: appTheme.dark,
            fontWeight: FontWeight.w800,
          ),
          headlineMedium: TextStyle(
            fontSize: 14,
            color: appTheme.dark,
            fontWeight: FontWeight.w400,
          ),
          headlineSmall: TextStyle(
            color: appTheme.light,
            fontWeight: FontWeight.w700,
          ));
  }

  static CustomTextTheme dark(BuildContext context) {
    return CustomTextTheme()..textTheme = const TextTheme();
  }

  static CustomTextTheme customTextTheme(BuildContext context) {
    final theme = Theme.of(context).brightness;
    return theme == Brightness.dark ? dark(context) : light(context);
  }
}
