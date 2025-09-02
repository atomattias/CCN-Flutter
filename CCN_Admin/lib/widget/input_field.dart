
import 'package:ccn_admin/utils/hex_color.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class InputField extends StatefulWidget {
  final String placeholder;
  final Function(String)? onChange;
  final double? border;
  final TextEditingController? controller; // Add controller property

  const InputField({
    Key? key,
    required this.placeholder,
    required this.onChange,
    this.border,
    this.controller,
  }) : super(key: key);

  @override
  State<InputField> createState() => _InputFieldState();
}

class _InputFieldState extends State<InputField> {
  late TextEditingController _textEditingController;

  @override
  void initState() {
    super.initState();
    _textEditingController = widget.controller ?? TextEditingController();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 46,
      child: CupertinoTextField(
        controller: _textEditingController, // Set the controller
        placeholder: widget.placeholder,
        onChanged: (value) {
          widget.onChange?.call(value);
        },
        padding: const EdgeInsets.symmetric(horizontal: 26.0, vertical: 12.0),
        decoration: BoxDecoration(
          border: Border.all(color: HexColor('#D3D3D3')),
          borderRadius: BorderRadius.circular(widget.border ?? 5),
        ),
        style: const TextStyle(
          fontSize: 16.0,
          color: CupertinoColors.black,
        ),
        cursorColor: CupertinoColors.activeBlue,
        placeholderStyle: const TextStyle(
          color: Color.fromARGB(255, 160, 150, 150),
          // Customize the placeholder text color here
        ),
      ),
    );
  }
}
