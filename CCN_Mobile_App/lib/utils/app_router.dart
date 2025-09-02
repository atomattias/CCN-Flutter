import 'package:flutter/material.dart';
import 'package:ccn/screens/auth/signin.dart';
import 'package:ccn/screens/auth/signup.dart';
import 'package:ccn/screens/landing.dart';
import 'package:ccn/screens/loader.dart';
import 'package:ccn/screens/home.dart';

class AppRoutes {
  static const String signIn = '/signin';
  static const String signUp = '/signup';
  static const String landing = '/landing';
  static const String loader = '/loader';
  static const String homeRoute = '/home';
}

class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case AppRoutes.signIn:
        return MaterialPageRoute(builder: (_) => const SignIn());
      case AppRoutes.signUp:
        return MaterialPageRoute(builder: (_) => const SignUp());
      case AppRoutes.landing:
        return MaterialPageRoute(builder: (_) => const Landing());
      case AppRoutes.loader:
        return MaterialPageRoute(builder: (_) => const Loader());
      case AppRoutes.homeRoute:
        return MaterialPageRoute(builder: (_) => const Home());
      default:
        return MaterialPageRoute(builder: (_) => const SignIn());
    }
  }
}
