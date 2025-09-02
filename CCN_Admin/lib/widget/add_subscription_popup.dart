import 'package:ccn_admin/provider/provider.dart';
import 'package:ccn_admin/widget/input_field.dart';
import 'package:ccn_admin/widget/spacer.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AddSubscription extends ConsumerStatefulWidget {
 final VoidCallback onDataUpdated;

  const AddSubscription({super.key, required this.onDataUpdated});


  @override
  ConsumerState<AddSubscription> createState() => _AddSubscriptionState();
}

class _AddSubscriptionState extends ConsumerState<AddSubscription> {
  TextEditingController title = TextEditingController();
  TextEditingController amount = TextEditingController();
  String _selectedCycle = '';

  @override
  Widget build(BuildContext context) {
    final subscriptionState = ref.watch(subscriptionControllerProvider);
    final size = MediaQuery.of(context).size;
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      contentPadding: const EdgeInsets.all(10),
      title: const Text('Add Subscription'),
      content: SizedBox(
        width: (size.width > 100) ? size.width / 3 : size.width - 350,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              InputField(
                  placeholder: "Type", onChange: (p0) {}, controller: title),
              spacer(20),
              const Text('Amount:'),
              TextField(
                controller: amount,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                inputFormatters: <TextInputFormatter>[
                  FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*$')),
                ],
                decoration: const InputDecoration(
                  hintText: 'Enter amount',
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.all(8),
                ),
              ),
              spacer(16),
              const Text('Subscription Cycle:'),
              Column(
                children: [
                  RadioListTile<String>(
                    title: const Text('Monthly'),
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
                  RadioListTile<String>(
                    title: Text('Weekly'),
                    value: 'Weekly',
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
                spacer(0),
              Text(
                subscriptionState.error != null
                    ? subscriptionState.error.toString()
                    : '',
                style: TextStyle(color: Colors.red),
              )
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
            ref
                .read(subscriptionControllerProvider.notifier)
                .createSubscription({
              "planDetails": {
                "type": _selectedCycle,
                "price": double.tryParse(amount.text),
              },
              "cycle": _selectedCycle
            }).then((value) => widget.onDataUpdated());
             
          },
          child: const Text('Save'),
        ),
      ],
    );
  }

  @override
  void dispose() {
    title.dispose();
    amount.dispose();
    super.dispose();
  }
}
