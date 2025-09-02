import 'package:ccn_admin/models/user_model.dart';
import 'package:ccn_admin/provider/provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AddUsers extends ConsumerStatefulWidget {
  final dynamic channelID;
  final List<User> channelUsers;
  final VoidCallback onDataUpdated;

   const AddUsers({super.key, required this.channelID,required this.channelUsers,required this.onDataUpdated});

  @override
  ConsumerState<AddUsers> createState() => _AddUsersState();
}

class _AddUsersState extends ConsumerState<AddUsers> {
  late TextEditingController _searchController;


  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Add Users"),
      ),
      body: Consumer(
        builder: (context, watch, child) {
          final channelModelsProvider = ref.watch(channelProvider);
          List<User> users = channelModelsProvider.users;
          users = users.where((user) => !widget.channelUsers.any((channelUser) => channelUser.id == user.id)).toList();


          if (_searchController.text.isNotEmpty) {
           
            users = users
                .where((user) => user.fullname
                    .toLowerCase()
                    .contains(_searchController.text.toLowerCase()))
                .toList();
          }


          return Column(
            children: [
              Container(
                width: double.infinity,
                margin:
                    const EdgeInsets.symmetric(horizontal: 40, vertical: 30),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      labelText: 'Search by name',
                      prefixIcon: Icon(Icons.search),
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (_) => setState(
                        () {
                          
                        }), // Trigger rebuild when search query changes
                  ),
                ),
              ),
              Expanded(
                child: Container(
                  width: double.infinity,
                  margin:
                      const EdgeInsets.symmetric(horizontal: 40, vertical: 30),
                  child: DataTable(
                      dividerThickness: .5,
                      border: TableBorder.all(color: Colors.black12),
                      columns: [
                        DataColumn(label: Text('User Name'.toUpperCase())),
                        DataColumn(label: Text('Role'.toUpperCase())),
                        DataColumn(label: Text('Status'.toUpperCase())),
                        DataColumn(label: Text('Actions'.toUpperCase())),
                      ],
                      rows: users.map<DataRow>((user) {
                       print(user.status);
                        return DataRow(cells: [
                          DataCell(Text(user.fullname)),
                          DataCell(Text(user.role)),
                          DataCell(Text(user.status)),
                          DataCell(Row(
                            children: [
                              Row(
                                children: [
                                  
                                  Checkbox(
                                    value: user.isSelected,
                                    onChanged: (bool? value) {
                                      print(user);
                                      setState(() {
                                        user.isSelected = value ??
                                            false; // Update the isSelected property
                                      });
                                    },
                                  ),
                                  SizedBox(width: 10),
                                  Text(user.fullname),
                                ],
                              ),
                              const SizedBox(width: 10),
                            ],
                          )),
                        ]);
                      }).toList()),
                ),
              ),
              
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(5),
                  ),
                ),
                child: const Text(
                  "Add Users",
                  style: TextStyle(color: Colors.white),
                ),
                onPressed: () {
                  print('===CHANNEL ID');
                  print(widget.channelID);
                  
                  print('====SELECTED USER IDs====');
                  List<String> selectedUserIds = users
                      .where((user) => user.isSelected)
                      .map((user) => user.id)
                      .toList();
                  print(selectedUserIds);

                  // Call the addUserToChannel function to add users to the channel
                  ref.read(channelControllerProvider.notifier).addUserToChannel(
                      channelID: widget.channelID, userIds: selectedUserIds).whenComplete(() => widget.onDataUpdated());
                },
              ),
             const Expanded(child: SizedBox())
            ],
          );
        },
      ),
    );
  }
}
