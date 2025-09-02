// ignore_for_file: prefer_const_constructors

import 'package:ccn_admin/provider/provider.dart';
import 'package:ccn_admin/widget/input_field.dart';
import 'package:ccn_admin/widget/spacer.dart';
import 'package:flutter/material.dart';
import 'package:ccn_admin/models/subscription_model.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class EditSubscriptionModal extends ConsumerStatefulWidget {
  final SubscriptionPlan subscription;

  const EditSubscriptionModal({Key? key, required this.subscription})
      : super(key: key);

  @override
  ConsumerState<EditSubscriptionModal> createState() =>
      _EditSubscriptionModalState();
}

class _EditSubscriptionModalState extends ConsumerState<EditSubscriptionModal> {
  late TextEditingController _priceController;
  late TextEditingController _descriptionController;
  String _selectedCycle = '';

  @override
  void initState() {
    super.initState();
    _priceController = TextEditingController(
        text: widget.subscription.planDetails.price.toString());
    _descriptionController =
        TextEditingController(text: widget.subscription.planDetails.type);
    _selectedCycle = widget.subscription.cycle;
  }

  @override
  Widget build(BuildContext context) {
    final subscriptionState = ref.watch(subscriptionControllerProvider);
    final size = MediaQuery.of(context).size;
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      contentPadding: const EdgeInsets.all(10),
      title: Text('Edit Subscription'),
      content: SizedBox(
        width: (size.width > 100) ? size.width / 3 : size.width - 350,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              InputField(
                  placeholder: "admin@work-email.com",
                  onChange: (p0) {},
                  controller: _priceController),
              spacer(20),
              const Text('Description:'),
              SizedBox(
                height: 120, // Adjust the height of the text field as needed
                child: TextField(
                  controller: _descriptionController,
                  maxLines: null, // Allow multiline input
                  decoration: const InputDecoration(
                    hintText: 'Enter description',
                    border:
                        OutlineInputBorder(), // Add border to make it look like a text area
                    contentPadding:
                        EdgeInsets.all(8), // Add padding for better appearance
                  ),
                ),
              ),
              spacer(16),
              const Text('Subscription Cycle:'),
              Column(
                children: [
                  RadioListTile<String>(
                    title: Text('Monthly'),
                    value: 'Monthly',
                    groupValue: _selectedCycle,
                    onChanged: (value) {
                      setState(() {
                        _selectedCycle = value!;
                      });
                    },
                  ),
                  RadioListTile<String>(
                    title: Text('Quarterly'),
                    value: 'Quarterly',
                    groupValue: _selectedCycle,
                    onChanged: (value) {
                      setState(() {
                        _selectedCycle = value!;
                      });
                    },
                  ),
                  RadioListTile<String>(
                    title: Text('Yearly'),
                    value: 'Yearly',
                    groupValue: _selectedCycle,
                    onChanged: (value) {
                      setState(() {
                        _selectedCycle = value!;
                      });
                    },
                  ),
                ],
              ),
              if (subscriptionState.isLoading)
                CircularProgressIndicator()
              else
                spacer(0)
            ],
          ),
        ),
      ),
      actions: <Widget>[
        TextButton(
          onPressed: () {
            Navigator.of(context).pop(); // Close the modal
          },
          child: Text('Cancel'),
        ),
        TextButton(
          onPressed: () {
            ref.read(subscriptionControllerProvider.notifier).editSubscription(
                id: widget.subscription.id, subscriptionData: {});
            // Navigator.pop(context);
          },
          child: Text('Save'),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _priceController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }
}
