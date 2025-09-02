import 'package:ccn/providers/_index.dart';
import 'package:ccn/utils/_index.dart';
import 'package:ccn/widgets/_index.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SignIn extends ConsumerStatefulWidget {
  const SignIn({super.key});

  @override
  ConsumerState<SignIn> createState() => _SignInState();
}

class _SignInState extends ConsumerState<SignIn> {
  late final TextEditingController _emailCtrl;
  late final TextEditingController _passwordCtrl;
  final _formKey = GlobalKey<FormState>();

  bool obscurePassword = true;
  bool isLoading = false;

  Widget spacer(double size) {
    return SizedBox(
      height: size,
    );
  }

  void showSnackBar(String message, Status status) {
    final appTheme = AppTheme.appTheme(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor:
            (Status.failed == status) ? appTheme.danger : appTheme.success,
        content: Text(message),
      ),
    );
  }

  gotoHome() => Navigator.pushNamed(context, AppRoutes.homeRoute);

  Future login() async {
    String email = _emailCtrl.text;
    String password = _passwordCtrl.text;
    try {
      setState(() {
        isLoading = true;
      });
      final resp = await ref.read(authProvider).login(
            email: email.trim(),
            password: password.trim(),
          );

      if (resp) gotoHome();
    } catch (err) {
      throw Exception(err);
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    _emailCtrl = TextEditingController();
    _passwordCtrl = TextEditingController();
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appTheme = AppTheme.appTheme(context);
    final textTheme = CustomTextTheme.customTextTheme(context).textTheme;
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(10.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // spacer(100),
                Image.asset("assets/images/Logo.png"),
                spacer(20),
                Text(
                  "Welcome back",
                  style: textTheme.headlineLarge,
                ),
                spacer(5),
                Text(
                  "CCN recommends email you use for work",
                  style: textTheme.headlineMedium,
                ),
                spacer(20),
                TextField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(
                        vertical: 0.0, horizontal: 10),
                    hintText: "name@work-email.com",
                    border: OutlineInputBorder(
                      borderSide: BorderSide(color: appTheme.border),
                    ),
                  ),
                ),
                spacer(20),
                TextField(
                  controller: _passwordCtrl,
                  keyboardType: TextInputType.visiblePassword,
                  obscureText: obscurePassword,
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(
                        vertical: 0.0, horizontal: 10),
                    hintText: "password",
                    suffixIcon: IconButton(
                      icon: obscurePassword
                          ? const Icon(
                              CupertinoIcons.eye_slash,
                              size: 20,
                            )
                          : const Icon(
                              CupertinoIcons.eye,
                              size: 20,
                            ),
                      onPressed: () {
                        setState(() {
                          obscurePassword = !obscurePassword;
                        });
                      },
                    ),
                    border: OutlineInputBorder(
                      borderSide: BorderSide(color: appTheme.border),
                    ),
                  ),
                ),
                spacer(20),
                SizedBox(
                  width: double.infinity,
                  child: CustomButton(
                    type: BtnType.filledBtn,
                    filledColor: appTheme.primary,
                    isLoading: isLoading,
                    title: "Signin",
                    onPressed: () {
                      if (_formKey.currentState!.validate()) login();
                    },
                  ),
                ),
                spacer(10),
                TextButton(
                  onPressed: () => Navigator.pushNamed(
                    context,
                    AppRoutes.signUp,
                  ),
                  child: const Text("Already have an account? Signin"),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
