import 'package:ccn_admin/screens/dashboard.dart';
import 'package:ccn_admin/screens/loader.dart';
import 'package:ccn_admin/screens/signin.dart';
import 'package:flutter/cupertino.dart';

class AppRoutes {
  static const String signIn = "/signin";
  static const String dashboard = '/dashboard';
  static const String users = '/users';
}

class AppRoute {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case AppRoutes.signIn:
        return _route(const SignIn());

      case AppRoutes.dashboard:
        return _route(const DashBoard());

      default:
        return _route(const Loader());
    }
  }

  static Route _route(Widget screen) {
    return CupertinoPageRoute(builder: (_) => screen);
  }
}
