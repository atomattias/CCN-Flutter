import 'package:ccn_admin/models/subscription_model.dart';
import 'package:ccn_admin/provider/provider.dart';
import 'package:ccn_admin/utils/enums_result.dart';
import 'package:ccn_admin/utils/utils.dart';
import 'package:ccn_admin/widget/add_subscription_popup.dart';
import 'package:ccn_admin/widget/alert_dialog.dart';
import 'package:ccn_admin/widget/edit_subscription_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Subscription extends ConsumerStatefulWidget {
  const Subscription({super.key});

  @override
  ConsumerState<Subscription> createState() => _SubscriptionState();
}

class _SubscriptionState extends ConsumerState<Subscription> {
  SubscriptionPlan? selectedSubscription;
  Stream<Result<List<SubscriptionPlan>>>? subscriptionStream;

  @override
  void initState() {
    super.initState();
    subscriptionStream = ref.read(subscriptionProvider).fetchSubscriptions();
  }

  @override
  Widget build(BuildContext context) {
    final mySubscription =  ref.read(subscriptionControllerProvider.notifier);
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
                  builder: (context) => AddSubscription(
                     onDataUpdated: () {
                // Reload the data when the callback function is called
                setState(() {
                  subscriptionStream = ref.read(subscriptionProvider).fetchSubscriptions();
                });
              },
                  ));
            },
            child: const Text(
              "ADD SUBSCRIPTION",
              style: TextStyle(color: Colors.white),
            ),
          ),
        ),
        StreamBuilder<Result<List<SubscriptionPlan>>>(
          stream:
              subscriptionStream, 
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
                    columns: [
                      DataColumn(label: Text('Type'.toUpperCase())),
                      DataColumn(label: Text('Price'.toUpperCase())),
                      DataColumn(label: Text('Cycle'.toUpperCase())),
                      DataColumn(label: Text('Created At'.toUpperCase())),
                      DataColumn(label: Text('Updated At'.toUpperCase())),
                      DataColumn(label: Text('Actions'.toUpperCase())),
                    ],
                    rows: result.data!.map<DataRow>((subscription) {
                      return DataRow(cells: [
                        DataCell(
                            Text(subscription.planDetails.type.toString())),
                        DataCell(Text(
                            '\$${subscription.planDetails.price.toString()}')),
                        DataCell(Text(subscription.cycle)),
                        DataCell(
                          Text(
                            formatDate(subscription.createdAt.toString()),
                            overflow: TextOverflow.ellipsis,
                            maxLines: 3,
                          ),
                        ),
                        DataCell(Text(
                          formatDate(subscription.updatedAt.toString()),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 3,
                        )),
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
                                  builder: (context) => EditSubscriptionModal(
                                    subscription: subscription,
                                  ),
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
                                showDialog(
                                  context: context,
                                  builder: (BuildContext context) {
                                    return AlertDialogWidget(
                                      titleText: 'Delete Item Confirmation',
                                      buttonText: 'Delete',
                                      onButtonPressed: () {
                                       
                                            mySubscription.deleteSubscription(
                                                id: subscription.id).whenComplete(() => setState(() {
                                          subscriptionStream = ref.read(subscriptionProvider).fetchSubscriptions();
                                        }));
                                        
                                        Navigator.of(context).pop();
                                      },
                                    );
                                  },
                                );
                              },
                            ),
                          ],
                        )),
                      ]);
                    }).toList(),
                  ),
                );
              } else {
                return const Center(child: Text('Failed to load subscription'));
              }
            } else {
              return const Center(child: Text('No data available'));
            }
          },
        ),
      ],
    );
  }
}
