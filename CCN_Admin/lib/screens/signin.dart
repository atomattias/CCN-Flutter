import 'package:ccn_admin/provider/provider.dart';
import 'package:ccn_admin/theme/app_theme.dart';
import 'package:ccn_admin/validators/validate_email_password.dart';
import 'package:ccn_admin/widget/custom_btn.dart';
import 'package:ccn_admin/widget/input_field.dart';
import 'package:ccn_admin/widget/logo_widget.dart';
import 'package:ccn_admin/widget/password_field.dart';
import 'package:ccn_admin/widget/spacer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SignIn extends ConsumerStatefulWidget {
  const SignIn({super.key});

  @override
  ConsumerState<SignIn> createState() => _SignInState();
}

class _SignInState extends ConsumerState<SignIn> {
  @override
  Widget build(BuildContext context) {
    final appTheme = AppTheme.appTheme(context);
    final loginState = ref.watch(loginControllerProvider);
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: MediaQuery.of(context).size.width * 0.4,
              child: Column(
                children: [
                  const LogoWidget(),
                  spacer(20),
                  Text(
                    "Welcome back",
                  ),
                  spacer(20),
                  InputField(
                    placeholder: "admin@work-email.com",
                    onChange: (p0) {},
                    controller: ref
                        .read(loginControllerProvider.notifier)
                        .emailController,
                  ),
                  spacer(8),
                  PasswordInputField(
                    placeholder: "Password",
                    onChange: (p0) {},
                    controller: ref
                        .read(loginControllerProvider.notifier)
                        .passwordController,
                  ),
                  spacer(20),
                  SizedBox(
                    width: double.infinity,
                    child: CustomButton(
                      type: BtnType.filledBtn,
                      filledColor: appTheme.primary,
                      title: "Sign in",
                      onPressed: () {
                        validateEmailPassword(
                          context: context,
                          emailController: ref
                              .read(loginControllerProvider.notifier)
                              .emailController,
                          passwordController: ref
                              .read(loginControllerProvider.notifier)
                              .passwordController,
                          ref: ref,
                        );
                      },
                    ),
                  ),
                  spacer(20),
                  if (loginState.isLoading) const CircularProgressIndicator() else spacer(0)
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
