part of widgets;

class CustomAppBar extends StatelessWidget {
  const CustomAppBar({super.key});

  Widget spaceX(double size) {
    return SizedBox(
      width: size,
    );
  }

  Widget spaceY(double size) {
    return SizedBox(
      height: size,
    );
  }

  @override
  Widget build(BuildContext context) {
    final appTheme = AppTheme.appTheme(context);
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 25.0, horizontal: 10.0),
      width: double.infinity,
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor,
        // borderRadius: const BorderRadius.only(
        // bottomLeft: Radius.circular(10.0),
        // bottomRight: Radius.circular(10.0),
        // ),
      ),
      child: Column(
        children: [
          spaceY(15),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SizedBox(
                child: Row(
                  children: [
                    SizedBox(
                      width: 35,
                      child: Image.asset("assets/images/icon.png"),
                    ),
                    spaceX(5),
                    Text(
                      "CCN",
                      style: TextStyle(
                        color: appTheme.light,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10.0),
                ),
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.asset(
                          "assets/images/profile.jpeg",
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Container(
                        height: 10,
                        width: 10,
                        decoration: BoxDecoration(
                          color: const Color(0xFF4CAF50),
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    )
                  ],
                ),
              )
            ],
          ),
          spaceY(20),
          Row(
            children: [
              Flexible(
                child: TextField(
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(
                      vertical: 0.0,
                      horizontal: 10.0,
                    ),
                    filled: true,
                    fillColor: appTheme.light,
                    border: OutlineInputBorder(
                      borderSide: BorderSide.none,
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                    prefixIcon: const Icon(CupertinoIcons.search),
                    hintText: "Jump to or search...",
                    hintStyle: const TextStyle(fontSize: 14),
                  ),
                ),
              ),
              spaceX(13),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: appTheme.light,
                  borderRadius: BorderRadius.circular(10.0),
                ),
                child: const Icon(Icons.filter_list),
              )
            ],
          )
        ],
      ),
    );
  }
}
