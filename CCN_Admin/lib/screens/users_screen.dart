import 'package:ccn_admin/models/user_model.dart';
import 'package:ccn_admin/provider/provider.dart';
import 'package:ccn_admin/widget/select_option.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class VerifyUsers extends ConsumerStatefulWidget {
  const VerifyUsers({super.key});

  @override
  ConsumerState<VerifyUsers> createState() => _VerifyUsersState();
}

class _VerifyUsersState extends ConsumerState<VerifyUsers> {
  // late TextEditingController _searchController;
  late ValueNotifier<bool> reloadNotifier;
  TextEditingController email = TextEditingController();
  TextEditingController password = TextEditingController();
  TextEditingController repeatPassword = TextEditingController();

  @override
  void initState() {
    super.initState();
    // _searchController = TextEditingController();
    reloadNotifier = ValueNotifier(false);
  }

  @override
  Widget build(BuildContext context) {
    final channelModelsProvider = ref.watch(channelProvider);
    final roleProvider = ref.read(userControllerProvider.notifier);
    List<User> users = channelModelsProvider.users;
    return ValueListenableBuilder<bool>(
      valueListenable: reloadNotifier,
      builder: (context, isReloaded, _) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Container(
              width: double.infinity,
              margin: const EdgeInsets.symmetric(horizontal: 40, vertical: 30),
              child: DataTable(
                dividerThickness: .5,
                border: TableBorder.all(color: Colors.black12),
                columns: const [
                  DataColumn(label: Text('Full Name')),
                  DataColumn(label: Text('Email')),
                  DataColumn(label: Text('Role')),
                  DataColumn(label: Text('Status')),
                  DataColumn(label: Text('Action')),
                ],
                rows: List<DataRow>.generate(
                  users.length,
                  (index) => DataRow(
                    cells: [
                      DataCell(Text(users[index].fullname)),
                      DataCell(Text(users[index].email)),
                      DataCell(Text(users[index].role.toString())),
                      DataCell(Text(users[index].status.toString())),
                      DataCell(Row(
                        children: [
                          if (users[index].status == 'UNVERIFIED')
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blueAccent,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(5),
                                ),
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 35),
                              ),
                              child: const Text(
                                "Verify",
                                style: TextStyle(color: Colors.white),
                              ),
                              onPressed: () {
                                ref
                                    .read(userControllerProvider.notifier)
                                    .verifyUser(users[index].id)
                                    .whenComplete(() {
                                  reloadNotifier.value = !reloadNotifier.value;
                                });
                              },
                            )
                          else
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.greenAccent,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(5),
                                ),
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 35),
                              ),
                              child: const Text(
                                "Verified",
                                style: TextStyle(color: Colors.white),
                              ),
                              onPressed: () {},
                            ),
                          const SizedBox(
                            width: 10,
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(5),
                              ),
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 35),
                            ),
                            child: const Text(
                              "Change role",
                              style: TextStyle(color: Colors.white),
                            ),
                            onPressed: () async {
                              final selectedRole = await showDialog<String>(
                                context: context,
                                builder: (context) => const RoleSelectionDialog(
                                  roleOptions: ['ADMIN', 'CLINICIAN'],
                                ),
                              );

                              if (selectedRole != null) {
                                // Handle the selected role
                                roleProvider.changeUserRole(
                                    users[index].fullname, selectedRole);
                              }
                            },
                          ),
                        ],
                      )),
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
