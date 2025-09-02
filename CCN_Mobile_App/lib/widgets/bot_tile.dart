part of widgets;

class BotTile extends StatelessWidget {
  final String bot, message;
  const BotTile({super.key, required this.bot, required this.message});

  @override
  Widget build(BuildContext context) {
    final appTheme = AppTheme.appTheme(context);
    final textTheme = CustomTextTheme.customTextTheme(context).textTheme;
    return ListTile(
      leading: Stack(
        children: [
          const CircleAvatar(
            radius: 15,
            backgroundColor: Colors.transparent,
            backgroundImage: AssetImage(
              "assets/images/bot.png",
            ),
          ),
          Positioned(
            right: 0,
            bottom: 0,
            child: CircleAvatar(
              radius: 6,
              backgroundColor: appTheme.light,
              child: CircleAvatar(
                radius: 4,
                backgroundColor: appTheme.success,
              ),
            ),
          )
        ],
      ),
      title: Text(
        bot,
        style: textTheme.labelSmall,
      ),
      trailing: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 10,
          vertical: 2,
        ),
        decoration: BoxDecoration(
          color: Theme.of(context).primaryColor,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          "2",
          style: TextStyle(
            color: appTheme.light,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }
}
