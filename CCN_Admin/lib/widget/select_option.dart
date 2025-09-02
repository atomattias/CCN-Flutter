import 'package:flutter/material.dart';

class RoleSelectionDialog extends StatefulWidget {
  final List<String> roleOptions;

  const RoleSelectionDialog({Key? key, required this.roleOptions})
      : super(key: key);

  @override
  _RoleSelectionDialogState createState() => _RoleSelectionDialogState();
}

class _RoleSelectionDialogState extends State<RoleSelectionDialog> {
  late String selectedRole;

  @override
  void initState() {
    super.initState();
    // Initialize selected role to the first role option
    selectedRole = widget.roleOptions.first;
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Select a Role'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: widget.roleOptions
            .map(
              (role) => RadioListTile<String>(
                title: Text(role),
                value: role,
                groupValue: selectedRole,
                onChanged: (value) {
                  setState(() {
                    selectedRole = value!;
                  });
                },
              ),
            )
            .toList(),
      ),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.of(context).pop(); // Close the dialog
          },
          child: Text('Cancel'),
        ),
        TextButton(
          onPressed: () {
            Navigator.of(context).pop(selectedRole); // Return selected role
          },
          child: Text('Select'),
        ),
      ],
    );
  }
}
