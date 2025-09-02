// ignore_for_file: prefer_const_constructors

import 'package:ccn_admin/models/user_model.dart';
import 'package:ccn_admin/provider/provider.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ViewUsers extends ConsumerStatefulWidget {
  final List<User> users;
  final String title;
  final String channelId;
  final VoidCallback onDataUpdated;

  const ViewUsers({super.key, required this.users, required this.title,required this.channelId,required this.onDataUpdated});

  @override
  ConsumerState<ViewUsers> createState() => _ViewUsersState();
}

class _ViewUsersState extends ConsumerState<ViewUsers> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Container(
        width: double.infinity,
        margin: const EdgeInsets.symmetric(horizontal: 40, vertical: 30),
        child: DataTable(
          dividerThickness: .5,
          border: TableBorder.all(color: Colors.black12),
          columns:const [
            DataColumn(label: Text('Full Name')),
            DataColumn(label: Text('Role')),
            DataColumn(label: Text('Action')),
          ],
          rows: widget.users.map((user) {
            return DataRow(cells: [
              DataCell(Text(user.fullname)),
              DataCell(Text(user.role)),
              DataCell(
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(5),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 35),
                  ),
                  child: const Text(
                    "Remove",
                    style: TextStyle(color: Colors.white),
                  ),
                  onPressed: () {
                    _removeUser(userId: user.id, channelID: widget.channelId);
                  },
                ),
              ),
            ]);
          }).toList(),
        ),
      ),
    );
  }

 void _removeUser({required String userId, required String channelID}) {
  showCupertinoDialog(
    context: context,
    builder: (BuildContext context) {
      return CupertinoAlertDialog(
        title: Text("Remove User"),
        content: Text("Are you sure you want to remove this user from the channel?"),
        actions: <Widget>[
          CupertinoDialogAction(
            onPressed: () {
              Navigator.of(context).pop();
              ref.read(channelControllerProvider.notifier).removeUserFromChannel(channelID: channelID, userID: userId).whenComplete(() {
                setState(() {
                widget.users.removeWhere((User user)=>user.id == userId);

              });

              widget.onDataUpdated();

              });
              
              
            },
            child: Text('Yes'),
          ),
          CupertinoDialogAction(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: Text('No'),
          ),
        ],
      );
    },
  );
}

}
