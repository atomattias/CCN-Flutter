import 'package:flutter/cupertino.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _ProfileState();
}

class _ProfileState extends State<NotificationScreen> {
  @override
  Widget build(BuildContext context) {
    return const SafeArea(
      child: Column(
        children: [
          Row(
            children: [Text("Notification")],
          )
        ],
      ),
    );
  }
}
