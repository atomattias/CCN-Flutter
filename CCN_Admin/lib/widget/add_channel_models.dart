import 'package:ccn_admin/models/tags_model.dart';
import 'package:ccn_admin/provider/provider.dart';
import 'package:ccn_admin/utils/enums_result.dart';
import 'package:ccn_admin/widget/input_field.dart';
import 'package:ccn_admin/widget/spacer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AddChannelModal extends ConsumerStatefulWidget {
  final String id;

  const AddChannelModal({Key? key, required this.id}) : super(key: key);

  @override
  ConsumerState<AddChannelModal> createState() => _AddChannelModalState();
}

class _AddChannelModalState extends ConsumerState<AddChannelModal> {
  TextEditingController nameController = TextEditingController();
  TextEditingController descriptionController = TextEditingController();
  Tag? selectedTag;
  bool isChecked = false;

  @override
  void initState() {
    super.initState();
    selectedTag = null;
  }

  @override
  Widget build(BuildContext context) {
    final channelState = ref.watch(channelControllerProvider);
    final tagState = ref.watch(subscriptionProvider);

    final size = MediaQuery.of(context).size;

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      contentPadding: const EdgeInsets.all(10),
      title: const Text('Add Channel'),
      content: SizedBox(
        width: (size.width > 100) ? size.width / 3 : size.width - 350,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              InputField(
                placeholder: "Channel Name",
                onChange: (value) {},
                controller: nameController,
              ),
              spacer(20),
              FutureBuilder<Result<List<Tag>>?>(
                future: tagState.fetchTags().first,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const CircularProgressIndicator();
                  } else if (snapshot.hasError) {
                    return Text('Error: ${snapshot.error}');
                  } else {
                    if (snapshot.data == null || !snapshot.data!.isSuccess) {
                      return Text('Failed to fetch tags');
                    }

                    final List<Tag> tags = snapshot.data!.data!;
                    selectedTag = snapshot.data!.data!.first;

                    return DropdownButtonFormField(
                      value: selectedTag,
                      onChanged: (Tag? value) {
                        selectedTag = value;
                      },
                      items: tags.map((tag) {
                        return DropdownMenuItem<Tag>(
                          value: tag,
                          child: Text(tag.name),
                          onTap: () {
                            selectedTag = tag;
                          },
                        );
                      }).toList(),
                    );
                  }
                },
              ),
              spacer(20),
              const Text('Description:'),
              SizedBox(
                height: 120,
                child: TextField(
                  controller: descriptionController,
                  maxLines: null,
                  decoration: const InputDecoration(
                    hintText: 'Enter description',
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.all(8),
                  ),
                ),
              ),
              Row(
                children: [
                  Checkbox(
                    value: isChecked,
                    onChanged: (bool? value) {
                      setState(() {
                        isChecked = value ?? false;
                      });
                    },
                  ),
                  Text(
                    'speciality',
                    style: TextStyle(fontSize: 20),
                  ),
                ],
              ),
              if (channelState.isLoading)
                CircularProgressIndicator()
              else
                spacer(0),
            ],
          ),
        ),
      ),
      actions: <Widget>[
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
          },
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: () {
            ref.read(channelControllerProvider.notifier).createChannel(
              channel: {
                'name': nameController.text,
                'description': descriptionController.text,
                'tag': selectedTag!.id,
                'specialty': isChecked,
                'owner': widget.id,
              },
            );
            print('=====PRINTING USER ID');
            print(widget.id);

            // Navigator.of(context).pop();
          },
          child: Text('Save'),
        ),
      ],
    );
  }

  @override
  void dispose() {
    nameController.dispose();
    descriptionController.dispose();
    super.dispose();
  }
}
