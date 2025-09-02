part of widgets;

class ChannelTile extends StatelessWidget {
  final String channel, message;
  const ChannelTile({super.key, required this.channel, required this.message});

  @override
  Widget build(BuildContext context) {
    // final appTheme = AppTheme.appTheme(context);
    final textTheme = CustomTextTheme.customTextTheme(context).textTheme;
    return ListTile(
      leading: Container(
        height: 50,
        width: 50,
        decoration: const BoxDecoration(color: Colors.transparent
            // color: appTheme.border.withOpacity(.1),
            // borderRadius: BorderRadius.circular(10.0),
            ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(10.0),
          child: Image.asset(
            "assets/images/specialist.jpg",
            fit: BoxFit.cover,
          ),
        ),
      ),
      title: Text(
        channel,
        style: textTheme.labelSmall,
      ),
      subtitle: Text(
        message,
        style: textTheme.bodySmall,
      ),
      // trailing: Container(
      //   padding: const EdgeInsets.symmetric(
      //     horizontal: 10,
      //     vertical: 2,
      //   ),
      //   decoration: BoxDecoration(
      //     color: Theme.of(context).primaryColor,
      //     borderRadius: BorderRadius.circular(20),
      //   ),
      //   child: Text(
      //     "2",
      //     style: TextStyle(
      //       color: appTheme.light,
      //       fontWeight: FontWeight.w800,
      //     ),
      //   ),
      // ),
    );
  }
}
