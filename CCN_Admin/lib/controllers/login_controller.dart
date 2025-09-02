// ignore_for_file: use_build_context_synchronously

import 'package:ccn_admin/provider/provider.dart';
import 'package:ccn_admin/utils/routes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';


class LoginController extends StateNotifier<LoginState> {
  final Ref ref;
  LoginController(this.ref) : super(LoginState.initial());

  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();

  Future<void> login(BuildContext context) async {
   
    try {
      state = LoginState.loading();
      print("loading");
      final success = await ref.read(authProvider).login(
          email: emailController.text, password: passwordController.text);
      if (success) {
        print("success");
        state = LoginState(isLoading: false);
        Navigator.pushReplacementNamed(context, AppRoutes.dashboard);
      } else {
        print('failed');
        // Navigator.pushReplacementNamed(context, AppRoutes.dashboard);
        state = LoginState.error('failed');
      }
    } catch (e) {
      print("catch");
      state = LoginState.error(e.toString());
    }
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }
}

class LoginState {
  final bool isLoading;
  final String? error;

  LoginState({required this.isLoading, this.error});

  factory LoginState.initial() => LoginState(isLoading: false);


  factory LoginState.loading() => LoginState(isLoading: true);

  factory LoginState.success() => LoginState(isLoading: false);

  factory LoginState.error(String error) => LoginState(isLoading: false);
}
