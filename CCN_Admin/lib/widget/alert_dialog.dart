import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AlertDialogWidget extends ConsumerStatefulWidget {
  final String titleText;
  final String buttonText;
  final VoidCallback onButtonPressed;

  const AlertDialogWidget({
    this.titleText = 'Alert',
    this.buttonText = 'OK',
    required this.onButtonPressed,
  });

  @override
  ConsumerState<AlertDialogWidget> createState() =>
      _AlertDialogWidgetState();
}

class _AlertDialogWidgetState extends ConsumerState<AlertDialogWidget> {
  @override
  Widget build(BuildContext context) {
     final size = MediaQuery.of(context).size;
    return AlertDialog(
       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      content: SizedBox(
        width: (size.width > 100) ? size.width / 3 : size.width - 350,
      ),
      title: Text(widget.titleText),
      actions: <Widget>[
        TextButton(
          onPressed: () {
            Navigator.of(context).pop(); // Close the modal
          },
          child: Text('Cancel'),
        ),
        TextButton(
          onPressed: widget.onButtonPressed,
          child: Text(widget.buttonText),
        ),
      ],
    );
  }
}
