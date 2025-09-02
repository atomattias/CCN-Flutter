part of widgets;

class CustomButton extends StatelessWidget {
  final String title;
  final VoidCallback onPressed;
  final Color filledColor;
  final BtnType type;
  final bool isLoading;

  const CustomButton({
    super.key,
    this.filledColor = const Color(0xffffffff),
    this.type = BtnType.defaultBtn,
    this.isLoading = false,
    required this.title,
    required this.onPressed,
  });

  ButtonStyle btnStyle(appTheme) {
    switch (type) {
      case BtnType.filledBtn:
        return ElevatedButton.styleFrom(
          padding: const EdgeInsets.all(10),
          backgroundColor: filledColor,
          shape: const RoundedRectangleBorder(),
        );
      default:
        return ElevatedButton.styleFrom(
          padding: const EdgeInsets.all(10),
          backgroundColor: filledColor,
          shape: RoundedRectangleBorder(
            side: BorderSide(color: appTheme.border),
          ),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final appTheme = AppTheme.appTheme(context);
    final textTheme = CustomTextTheme.customTextTheme(context).textTheme;
    return ElevatedButton(
      onPressed: onPressed,
      style: btnStyle(appTheme),
      child: isLoading
          ? const CupertinoActivityIndicator()
          : Text(
              title,
              style: (BtnType.filledBtn != type)
                  ? textTheme.headlineMedium
                  : textTheme.headlineSmall,
            ),
    );
  }
}
