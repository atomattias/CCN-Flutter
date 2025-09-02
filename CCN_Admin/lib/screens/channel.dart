import 'package:ccn_admin/models/channels_model.dart';
import 'package:ccn_admin/provider/provider.dart';
import 'package:ccn_admin/screens/add_users.dart';
import 'package:ccn_admin/screens/view_users.dart';
import 'package:ccn_admin/utils/enums_result.dart';
import 'package:ccn_admin/widget/add_channel_models.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Channels extends ConsumerStatefulWidget {
  final String id;

  const Channels({super.key, required this.id});

  @override
  ConsumerState<Channels> createState() => _ChannelsState();
}

class _ChannelsState extends ConsumerState<Channels> {
  // ChannelModel? channels;
  Stream<Result<List<ChannelModel>>>? channelStream;

  @override
  void initState() {
    super.initState();
    channelStream = ref.read(channelProvider).fetchChannelModels();
    _updateProvider();
  }

  void _updateProvider() {
    ref.read(channelProvider.notifier).getAllUsers();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.read(authProvider).user;
    // final state = ref.watch(channelControllerProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        const SizedBox(
          height: 10,
        ),
        Padding(
          padding: const EdgeInsets.only(right: 40.0, top: 10),
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(5)),
              backgroundColor: Theme.of(context).primaryColor,
            ),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AddChannelModal(
                  id: user!.id,
                ),
              );
            },
            child: const Text(
              "ADD CHANNEL",
              style: TextStyle(color: Colors.white),
            ),
          ),
        ),
        StreamBuilder(
            stream: channelStream,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              } else if (snapshot.hasError) {
                return Center(child: Text('Error: ${snapshot.error}'));
              } else if (snapshot.hasData) {
                final result = snapshot.data!;
                if (result.isSuccess) {
                  return Container(
                    width: double.infinity,
                    margin: const EdgeInsets.symmetric(
                        horizontal: 40, vertical: 30),
                    child: DataTable(
                      dividerThickness: .5,
                      border: TableBorder.all(color: Colors.black12),
                      columns: [
                        DataColumn(label: Text('Channel Name'.toUpperCase())),
                        DataColumn(label: Text('Owner'.toUpperCase())),
                        DataColumn(label: Text('Total Users'.toUpperCase())),
                        DataColumn(label: Text('Actions'.toUpperCase())),
                      ],
                      rows: result.data!.map<DataRow>((channel) {
                        return DataRow(cells: [
                          DataCell(Text(channel.name)),
                          DataCell(Text(channel.owner['fullname'])),
                          DataCell(Text(channel.users.length.toString())),
                          DataCell(Row(
                            children: [
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
                                  Navigator.push(context, MaterialPageRoute(
                                    builder: (context) {
                                      return AddUsers(
                                        channelID: channel.id,
                                        channelUsers: channel.users,
                                        onDataUpdated: () {
                                          setState(() {
                                            channelStream = ref
                                                .read(channelProvider)
                                                .fetchChannelModels();
                                          });
                                        },
                                      );
                                    },
                                  ));
                                },
                              ),
                              const SizedBox(width: 10),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.blueAccent,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(5),
                                  ),
                                ),
                                child: const Text(
                                  "View",
                                  style: TextStyle(color: Colors.white),
                                ),
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => ViewUsers(
                                        users: channel.users,
                                        title: channel.name,
                                        channelId: channel.id,
                                        onDataUpdated: () {
                                          setState(() {
                                            channelStream = ref
                                                .read(channelProvider)
                                                .fetchChannelModels();
                                          });
                                        },
                                      ),
                                    ),
                                  );
                                },
                              ),
                              const SizedBox(width: 10),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: !channel.disabled
                                      ? Colors.red
                                      : Colors.purple,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(5),
                                  ),
                                ),
                                child: Text(
                                  !channel.disabled ? "Disable" : "Enable",
                                  style: const TextStyle(color: Colors.white),
                                ),
                                onPressed: () {
                                  showCupertinoDialog(
                                    context: context,
                                    builder: (BuildContext context) {
                                      return CupertinoAlertDialog(
                                        title: Text(!channel.disabled
                                            ? "Disable Channel"
                                            : "Enable Channel"),
                                        content: Text(!channel.disabled
                                            ? "Are you sure you want to disable this channel?"
                                            : "Are you sure you want to enable this channel?"),
                                        actions: <Widget>[
                                          CupertinoDialogAction(
                                            onPressed: () {
                                              final disableChannel =
                                                  !channel.disabled;
                                              ref
                                                  .read(
                                                      channelControllerProvider
                                                          .notifier)
                                                  .changeChannelStatus(
                                                      disabled: disableChannel,
                                                      channelID: channel.id)
                                                  .whenComplete(() {
                                                setState(() {
                                                  channelStream = ref
                                                      .read(channelProvider)
                                                      .fetchChannelModels();
                                                });
                                              });
                                              Navigator.of(context).pop();
                                            },
                                            child: Text('Yes'),
                                          ),
                                          CupertinoDialogAction(
                                            onPressed: () {
                                              Navigator.of(context).pop();
                                            },
                                            child: Text('No'),
                                          ),
                                        ],
                                      );
                                    },
                                  );
                                },
                              )
                            ],
                          )),
                        ]);
                      }).toList(),
                    ),
                  );
                } else {
                  // If channels list is empty
                  return const Center(child: Text('No channels available'));
                }
              } else {
                // If fetching channels failed
                return const Center(child: Text('Failed to load channels'));
              }
            }),
      ],
    );
  }
}
