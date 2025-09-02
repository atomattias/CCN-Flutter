import 'package:ccn_admin/controllers/subscription_controller.dart';
import 'package:ccn_admin/models/tags_model.dart';
import 'package:ccn_admin/provider/provider.dart';
import 'package:ccn_admin/utils/enums_result.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Tags extends ConsumerStatefulWidget {
  const Tags({super.key});

  @override
  ConsumerState<Tags> createState() => _TagsState();
}

class _TagsState extends ConsumerState<Tags> {
  late Stream<Result<List<Tag>>> tagStream;

  @override
  void initState() {
    super.initState();
    tagStream = ref.read(subscriptionProvider).fetchTags();
  }

  @override
  Widget build(BuildContext context) {
    final tags = ref.read(subscriptionControllerProvider.notifier);
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
                borderRadius: BorderRadius.circular(5),
              ),
              backgroundColor: Theme.of(context).primaryColor,
            ),
            onPressed: () {
              showDialog(
                context: context,
                builder: (BuildContext context) {
                  String tagName = '';
                  String tagDescription = '';

                  return AlertDialog(
                    title: Text('Add Tag'),
                    content: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        TextField(
                          decoration: InputDecoration(labelText: 'Tag Name'),
                          onChanged: (value) {
                            tagName = value;
                          },
                        ),
                        TextField(
                          decoration:
                              InputDecoration(labelText: 'Tag Description'),
                          onChanged: (value) {
                            tagDescription = value;
                          },
                        ),
                      ],
                    ),
                    actions: [
                      TextButton(
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                        child: Text('Cancel'),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          tags.addTag({
                            'name': tagName,
                            'description': tagDescription
                          }).whenComplete(() {
                            setState(() {
                              tagStream =
                                  ref.read(subscriptionProvider).fetchTags();
                            });
                          });
                          Navigator.of(context).pop();
                        },
                        child: Text('Add'),
                      ),
                    ],
                  );
                },
              );
            },
            child: const Text(
              "ADD Tags",
              style: TextStyle(color: Colors.white),
            ),
          ),
        ),
        StreamBuilder<Result<List<Tag>>>(
          stream: tagStream,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            } else if (snapshot.hasError) {
              return Center(child: Text('Error: ${snapshot.error}'));
            } else if (snapshot.hasData) {
              var result = snapshot.data!;
              if (result.isSuccess) {
                return Container(
                  width: double.infinity,
                  margin:
                      const EdgeInsets.symmetric(horizontal: 40, vertical: 30),
                  child: DataTable(
                    dividerThickness: .5,
                    border: TableBorder.all(color: Colors.black12),
                    columns: const [
                      DataColumn(label: Text('Tag Name')),
                      DataColumn(label: Text('Description')),
                      DataColumn(label: Text('Action')),
                      // Add more DataColumn if your Tag model has additional properties
                    ],
                    rows: result.data!.map<DataRow>((tag) {
                      return DataRow(cells: [
                        DataCell(Text(tag.name)),
                        DataCell(Text(tag.description)),
                        DataCell(Row(
                          children: [
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
                                "Edit",
                                style: TextStyle(color: Colors.white),
                              ),
                              onPressed: () {
                                showDialog(
                                  context: context,
                                  builder: (BuildContext context) {
                                    String tagName = tag
                                        .name; // Initialize with current tag name
                                    String tagDescription = tag
                                        .description; // Initialize with current tag description

                                    return AlertDialog(
                                      title: Text('Edit Tag'),
                                      content: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          TextFormField(
                                            initialValue:
                                                tagName, // Set initial value to current tag name
                                            decoration: InputDecoration(
                                                labelText: 'Tag Name'),
                                            onChanged: (value) {
                                              tagName = value;
                                            },
                                          ),
                                          TextFormField(
                                            initialValue:
                                                tagDescription, // Set initial value to current tag description
                                            decoration: InputDecoration(
                                                labelText: 'Tag Description'),
                                            onChanged: (value) {
                                              tagDescription = value;
                                            },
                                          ),
                                        ],
                                      ),
                                      actions: [
                                        TextButton(
                                          onPressed: () {
                                            Navigator.of(context).pop();
                                          },
                                          child: Text('Cancel'),
                                        ),
                                        ElevatedButton(
                                          onPressed: () {
                                            tags.editTag({
                                              'id': tag.id,
                                              'name': tagName,
                                              'description': tagDescription
                                            }).whenComplete(() {
                                              setState(() {
                                                tagStream = ref
                                                    .read(subscriptionProvider)
                                                    .fetchTags();
                                              });
                                            });
                                            Navigator.of(context).pop();
                                          },
                                          child: Text('Edit'),
                                        ),
                                      ],
                                    );
                                  },
                                );
                              },
                            ),
                            const SizedBox(
                              width: 10,
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(5),
                                ),
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 35),
                              ),
                              child: const Text(
                                "Delete",
                                style: TextStyle(color: Colors.white),
                              ),
                              onPressed: () {
                                showDeleteTagDialog(context, tags, tag);
                              },
                            ),
                          ],
                        )),
                        // Add more DataCell if your Tag model has additional properties
                      ]);
                    }).toList(),
                  ),
                );
              } else {
                return const Center(child: Text('Failed to load tags'));
              }
            } else {
              return const Center(child: Text('No data available'));
            }
          },
        ),
      ],
    );
  }

  Future<bool?> showDeleteTagDialog(
      BuildContext context, SubscriptionController tags, Tag tag) async {
    return await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return CupertinoAlertDialog(
          title: Text('Delete Tag'),
          content: Text('Are you sure you want to delete this tag?'),
          actions: <Widget>[
            CupertinoDialogAction(
              child: Text('Cancel'),
              onPressed: () {
                Navigator.of(context)
                    .pop(false); // Return false indicating cancellation
              },
            ),
            CupertinoDialogAction(
              child: Text('Delete'),
              onPressed: () {
                tags.deleteTag(tag.id).whenComplete(() {
                  setState(() {
                    tagStream = ref.read(subscriptionProvider).fetchTags();
                  });
                  Navigator.pop(context);
                });
              },
              isDestructiveAction: true,
            ),
          ],
        );
      },
    );
  }
}
