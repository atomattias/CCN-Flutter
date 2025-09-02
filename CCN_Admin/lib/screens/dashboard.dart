import 'package:animated_floating_buttons/widgets/animated_floating_action_button.dart';
import 'package:ccn_admin/provider/provider.dart';
import 'package:ccn_admin/screens/Tags.dart';
import 'package:ccn_admin/screens/channel.dart';
import 'package:ccn_admin/screens/subscription.dart';
import 'package:ccn_admin/screens/users_screen.dart';
import 'package:ccn_admin/utils/hex_color.dart';
import 'package:ccn_admin/widget/add_channel_models.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class DashBoard extends ConsumerStatefulWidget {
  const DashBoard({Key? key}) : super(key: key);

  @override
  ConsumerState<DashBoard> createState() => _DashBoardState();
}

class _DashBoardState extends ConsumerState<DashBoard> {
  final GlobalKey<AnimatedFloatingActionButtonState> key =
      GlobalKey<AnimatedFloatingActionButtonState>();

  int selectedIndex = 0;

  bool isExpanded = false;

  @override
  Widget build(BuildContext context) {
    final userController = ref.read(userControllerProvider);

    return Scaffold(
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Container(
            child: NavigationRail(
              elevation: 2.0,
              extended: isExpanded,
              onDestinationSelected: (val) {
                setState(() {
                  selectedIndex = val;
                });
              },
              destinations: [
                NavigationRailDestination(
                  indicatorShape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  icon: const Icon(Icons.home),
                  label: const Text("Subscription"),
                ),
                NavigationRailDestination(
                  indicatorShape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  icon: const Icon(Icons.bar_chart),
                  label: const Text("Channels"),
                ),
                NavigationRailDestination(
                  indicatorShape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  icon: const Icon(Icons.tag_sharp),
                  label: const Text("Tags"),
                ),
                NavigationRailDestination(
                  indicatorShape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  icon: const Icon(Icons.verified_user_sharp),
                  label: const Text("Users"),
                ),
              ],
              selectedIndex: selectedIndex,
            ),
          ),
          Expanded(
            child: ListView(
              children: [
                Container(
                  decoration: BoxDecoration(color: HexColor('#F1F2F7')),
                  width: MediaQuery.of(context).size.width,
                  height: 50,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        onPressed: () {
                          setState(() {
                            isExpanded = !isExpanded;
                          });
                        },
                        icon: const Icon(Icons.menu),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(right: 12.0),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 20,
                              backgroundColor: Colors.white,
                              child: Text(userController != null &&
                                      userController.fullname.isNotEmpty
                                  ? userController.fullname[0]
                                  : 'Unknown'),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              userController != null
                                  ? userController.fullname
                                  : 'Unknown',
                              style: const TextStyle(fontSize: 16),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                if (selectedIndex == 0) ...[
                  // Content for Home selected
                  const Subscription()
                ] else if (selectedIndex == 1) ...[
                  Channels(
                    id: ref.read(userControllerProvider)!.id,
                  )
                ] else if (selectedIndex == 2) ...[
                  const Tags()
                ] else if (selectedIndex == 3) ...[
                  const VerifyUsers()
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget float1() {
    return FloatingActionButton(
      onPressed: () {
        showDialog(
          context: context,
          builder: (context) => AddChannelModal(
            id: ref.read(userControllerProvider)!.id,
          ),
        );
      },
      heroTag: "btn1",
      tooltip: 'Create Channels',
      child: const Icon(Icons.wifi_channel),
    );
  }

  Widget float2() {
    return FloatingActionButton(
      onPressed: () {},
      heroTag: "btn2",
      tooltip: 'Create Subscription',
      child: const Icon(Icons.add),
    );
  }
}
