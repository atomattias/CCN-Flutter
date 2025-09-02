import 'package:ccn/screens/home.dart';
import 'package:ccn/screens/notification.dart';
import 'package:ccn/utils/_index.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({Key? key}) : super(key: key);

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  int _currentIndex = 0;

  final List<Widget> pages = [
    const Home(),
    Container(),
    const NotificationScreen(),
    Container(), // Replace with your other pages
  ];

  @override
  Widget build(BuildContext context) {
    final appTheme = AppTheme.appTheme(context);
    final textTheme = CustomTextTheme.customTextTheme(context).textTheme;
    return Scaffold(
      floatingActionButton: (_currentIndex == 0)
          ? FloatingActionButton(
              backgroundColor: Theme.of(context).primaryColor,
              onPressed: () {},
              tooltip: "Add chat or channel",
              child: Icon(
                CupertinoIcons.plus,
                color: Theme.of(context).primaryColorLight,
              ),
            )
          : null,
      body: pages.elementAt(_currentIndex),
      bottomNavigationBar: Container(
        margin: const EdgeInsets.only(left: 10, right: 10, bottom: 15),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          color: appTheme.light,
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.2),
              blurRadius: 9,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: BottomAppBar(
          height: 72,
          elevation: 0,
          padding: EdgeInsets.zero,
          color: Colors.transparent,
          shape: const CircularNotchedRectangle(),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Container(
              color: appTheme.light,
              padding: EdgeInsets.zero,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildNavBarItem(CupertinoIcons.home, "Home", textTheme, 0),
                  _buildNavBarItem(CupertinoIcons.phone, "Calls", textTheme, 1),
                  _buildNavBarItem(
                      CupertinoIcons.bell, "Notifications", textTheme, 2),
                  _buildNavBarItem(
                      CupertinoIcons.ellipsis_circle, "More", textTheme, 3),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavBarItem(IconData icon, String tab, textTheme, int index) {
    return Expanded(
      child: InkWell(
        onTap: () {
          setState(() {
            _currentIndex = index;
          });
        },
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon,
                size: 24,
                color: _currentIndex == index
                    ? Theme.of(context).primaryColor
                    : Colors.black45),
            const SizedBox(
              height: 8,
            ),
            Text(
              tab,
              style: textTheme.bodySmall.copyWith(
                color: _currentIndex == index
                    ? Theme.of(context).primaryColor
                    : Colors.black45,
                fontWeight: FontWeight.w700,
                fontSize: 11.00,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
