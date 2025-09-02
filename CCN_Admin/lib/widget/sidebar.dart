import 'package:ccn_admin/utils/hex_color.dart';
import 'package:ccn_admin/widget/logo_widget.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class SideMenu extends StatelessWidget {
  const SideMenu({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: HexColor('#F1F2F7'),
      child: ListView(
        children: [
          const DrawerHeader(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                LogoWidget(),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Text("CCN"),
                )
              ],
            ),
          ),
          DrawerListTile(
            title: "Channel",
            icon: CupertinoIcons.antenna_radiowaves_left_right,
            press: () {},
          ),
          DrawerListTile(
            title: "Subscription",
            icon: CupertinoIcons.star_lefthalf_fill,
            press: () {},
          ),
        ],
      ),
    );
  }
}

class DrawerListTile extends StatelessWidget {
  const DrawerListTile({
    Key? key,
    // For selecting those three line once press "Command+D"
    required this.title,
    required this.icon,
    required this.press,
  }) : super(key: key);

  final String title;
  final IconData icon;
  final VoidCallback press;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: press,
      leading: Icon(icon),
      title: Text(
        title,
        style: TextStyle(color: Colors.black),
      ),
    );
  }
}
