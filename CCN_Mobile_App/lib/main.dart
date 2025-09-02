import 'package:ccn/utils/_index.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(
    const ProviderScope(
      child: CCN(),
    ),
  );
}

class CCN extends StatelessWidget {
  const CCN({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CCN',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppTheme.appTheme(context).primary,
        ),
        useMaterial3: true,
        textTheme: GoogleFonts.plusJakartaSansTextTheme(),
      ),
      initialRoute: AppRoutes.signIn,
      onGenerateRoute: AppRouter.generateRoute,
      debugShowCheckedModeBanner: false,
    );
  }
}
