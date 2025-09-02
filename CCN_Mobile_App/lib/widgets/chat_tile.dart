part of widgets;

class ChatTile extends StatelessWidget {
  final String channel, message;
  const ChatTile({super.key, required this.channel, required this.message});

  @override
  Widget build(BuildContext context) {
    final appTheme = AppTheme.appTheme(context);
    final textTheme = CustomTextTheme.customTextTheme(context).textTheme;
    return ListTile(
      leading: CircleAvatar(
        radius: 25,
        backgroundColor: appTheme.border.withOpacity(.1),
        backgroundImage: const AssetImage("assets/images/Logo-CCN.png"),
      ),
      title: Text(
        channel,
        style: textTheme.labelSmall,
      ),
      subtitle: Text(
        message,
        style: textTheme.bodySmall,
      ),
    );
  }
}
