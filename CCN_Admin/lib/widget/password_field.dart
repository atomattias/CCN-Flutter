
import 'package:ccn_admin/theme/app_theme.dart';
import 'package:ccn_admin/utils/hex_color.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class PasswordInputField extends StatefulWidget {
  final String placeholder;
  final Function(String)? onChange;
  final TextEditingController? controller;

  const PasswordInputField({
    Key? key,
    required this.placeholder,
    required this.onChange,
    this.controller,
  }) : super(key: key);

  @override
  State<PasswordInputField> createState() => _PasswordInputFieldState();
}

class _PasswordInputFieldState extends State<PasswordInputField> {
  late TextEditingController _textEditingController;

  @override
  void initState() {
    super.initState();
    _textEditingController = widget.controller ?? TextEditingController();
  }

  bool _obscureText = true;

  @override
  Widget build(BuildContext context) {
    final appTheme = AppTheme.appTheme(context);
    return SizedBox(
      height: 46,
      child: CupertinoTextField(
        controller: _textEditingController, // Set the controller
        obscureText: _obscureText,
        onChanged: (value) {
          widget.onChange?.call(value);
        },
        placeholder: widget.placeholder,
        padding: const EdgeInsets.symmetric(horizontal: 25.0, vertical: 12.0),
        decoration: BoxDecoration(
          border: Border.all(color: HexColor('#D3D3D3')),
          borderRadius: BorderRadius.circular(5.0),
        ),
        style: const TextStyle(
          fontSize: 16.0,
          color: CupertinoColors.black,
        ),
        suffix: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () {
            setState(() {
              _obscureText = !_obscureText;
            });
          },
          child: _obscureText
              ? Icon(
                  CupertinoIcons.eye_slash,
                  size: 20,
                  color: appTheme.dark.withOpacity(.5),
                )
              : Icon(
                  CupertinoIcons.eye,
                  size: 20,
                  color: appTheme.dark.withOpacity(.5),
                ),
        ),
        placeholderStyle: const TextStyle(
          color: Color.fromARGB(
              255, 160, 150, 150), // Customize the placeholder text color here
        ),
      ),
    );
  }
}
