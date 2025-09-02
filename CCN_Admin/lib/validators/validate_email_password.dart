
import 'package:ccn_admin/provider/provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quickalert/models/quickalert_type.dart';
import 'package:quickalert/widgets/quickalert_dialog.dart';


void validateEmailPassword(
    {required BuildContext context,
    required TextEditingController emailController,
    required TextEditingController passwordController,
    required WidgetRef ref}) {
  final RegExp emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');

  if (emailController.text.isEmpty || passwordController.text.isEmpty) {
    QuickAlert.show(
      context: context,
      type: QuickAlertType.error,
      title: 'Oops...',
      text: 'Please fill in the fields',
    );
  } else if (!emailRegex.hasMatch(emailController.text)) {
    QuickAlert.show(
      context: context,
      type: QuickAlertType.error,
      title: 'Oops...',
      text: 'Email is incorrect',
    );
  } else {
    ref.read(loginControllerProvider.notifier).login(context);
    // emailController.clear();
    // passwordController.clear();
  }
}
