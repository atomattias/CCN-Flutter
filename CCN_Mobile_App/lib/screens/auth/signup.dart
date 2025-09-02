import 'package:ccn/utils/_index.dart';
import 'package:ccn/widgets/_index.dart';
import 'package:flutter/material.dart';

class SignUp extends StatefulWidget {
  const SignUp({super.key});

  @override
  State<SignUp> createState() => _SignUpState();
}

final TextEditingController _emailCtrl = TextEditingController();

Widget spacer(double size) {
  return SizedBox(
    height: size,
  );
}

class _SignUpState extends State<SignUp> {
  @override
  Widget build(BuildContext context) {
    final appTheme = AppTheme.appTheme(context);
    final textTheme = CustomTextTheme.customTextTheme(context).textTheme;
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 10),
            child: TextButton(
              onPressed: () => Navigator.pushNamed(
                context,
                AppRoutes.signIn,
              ),
              child: const Text("Login"),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          // mainAxisAlignment: MainAxisAlignment.center,
          children: [
            spacer(50),
            Image.asset("assets/images/Logo.png"),
            spacer(52),
            Text(
              "Provide Work Email Address",
              style: textTheme.headlineLarge,
            ),
            spacer(5),
            Text(
              "CCN recommends email you use for work",
              style: textTheme.headlineMedium,
            ),
            spacer(30),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              width: double.infinity,
              child: TextField(
                controller: _emailCtrl,
                decoration: InputDecoration(
                  contentPadding:
                      const EdgeInsets.symmetric(vertical: 0.0, horizontal: 10),
                  hintText: "name@work-email.com",
                  border: OutlineInputBorder(
                    borderSide: BorderSide(color: appTheme.border),
                  ),
                ),
              ),
            ),
            spacer(20),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              width: double.infinity,
              child: CustomButton(
                type: BtnType.filledBtn,
                title: "Continue",
                filledColor: Theme.of(context).primaryColor,
                onPressed: () => Navigator.pushNamed(
                  context,
                  AppRoutes.homeRoute,
                ),
              ),
            ),
            spacer(25),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 30),
              child: const Row(
                children: [
                  Expanded(child: Divider()),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.0),
                    child: Text("OR"),
                  ),
                  Expanded(child: Divider()),
                ],
              ),
            ),
            spacer(25),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              width: double.infinity,
              child: CustomButton(
                filledColor: Theme.of(context).scaffoldBackgroundColor,
                title: "Continue With Google",
                onPressed: () {},
              ),
            ),
            spacer(15),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              width: double.infinity,
              child: CustomButton(
                filledColor: Theme.of(context).scaffoldBackgroundColor,
                title: "Continue With Apple",
                onPressed: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }
}
