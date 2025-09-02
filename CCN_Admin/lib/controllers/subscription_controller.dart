// ignore_for_file: use_build_context_synchronously
import 'package:ccn_admin/provider/provider.dart';
import 'package:ccn_admin/screens/subscription.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SubscriptionController extends StateNotifier<SubscriptionState> {
  final Ref ref;

  SubscriptionController(this.ref) : super(SubscriptionState.initial());

  List<Subscription> subscriptions = [];
  String? paymentUrl;
  String? paymentReference;
  String? message;
  bool? showMessage;

  Future<void> createSubscription(Map<String, dynamic> subscriptionData) async {
    try {
      state = SubscriptionState.loading();
      final result = await ref
          .read(subscriptionProvider)
          .createSubscription(subscriptionData);
      if (result.isSuccess) {
        state = SubscriptionState.success();
      } else {
        state = SubscriptionState.error(
            result.error ?? 'Failed to create subscription');
      }
    } catch (e) {
      state = SubscriptionState.error('Error creating subscription: $e');
    }
  }

  Future<void> deleteSubscription({required id}) async {
    try {
      // state = SubscriptionState.loading();
      EasyLoading.show(dismissOnTap: false, status: 'Deleting Items...');
      final result =
          await ref.read(subscriptionProvider).deleteSubscription(id);
      if (result.isSuccess) {
        state = SubscriptionState.success();
        EasyLoading.dismiss();
        EasyLoading.showSuccess('Deleted Successfully');
      } else {
        EasyLoading.dismiss();
        state = SubscriptionState.error(
            result.error ?? 'Failed to delete subscription');
      }
    } catch (e) {
      state = SubscriptionState.error('Error deleting subscription: $e');
    }
  }

  // UPDATE SUBSCRIPTION

  Future<void> editSubscription(
      {required id, required Map<String, dynamic> subscriptionData}) async {
    print('subscription');
    try {
      state = SubscriptionState.loading();
      final result = await ref.read(subscriptionProvider).editSubscription(
          subscriptionId: id, subscriptionData: subscriptionData);

      print('finish');
      if (result.isSuccess) {
        state = SubscriptionState.success();
      } else {
        state = SubscriptionState.error(
            result.error ?? 'Failed to edit subscription');
      }
    } catch (e) {
      state = SubscriptionState.error('Error deleting subscription: $e');
    }
  }

  Future<void> addTag(Map<String, dynamic> tagData) async {
    try {
      // state = SubscriptionState.loading();
      EasyLoading.show(status: 'Adding tags');
      final result = await ref.read(subscriptionProvider).addTag(tagData);
      if (result.isSuccess) {
        EasyLoading.dismiss();
        EasyLoading.showSuccess('Tag added');
        state = SubscriptionState.success();
      } else {
        EasyLoading.dismiss();
        EasyLoading.showError('Failed');
        state = SubscriptionState.error(result.error ?? 'Failed to add tag');
      }
    } catch (e) {
      EasyLoading.dismiss();
      EasyLoading.showError('Failed');
      state = SubscriptionState.error('Error adding tag: $e');
    }
  }


  Future<void> editTag(Map<String, dynamic> tagData) async {
    try {
      state = SubscriptionState.loading();
      final result = await ref.read(subscriptionProvider).editTag(tagData);
      if (result.isSuccess) {
        state = SubscriptionState.success();
      } else {
        state = SubscriptionState.error(result.error ?? 'Failed to edit tag');
      }
    } catch (e) {
      state = SubscriptionState.error('Error editing tag: $e');
    }
  }


  Future<void> deleteTag(String tagId) async {
    try {
      EasyLoading.show(status: 'please wait');
      state = SubscriptionState.loading();

      final result = await ref.read(subscriptionProvider).deleteTag(tagId);

      if (result.isSuccess) {
        EasyLoading.dismiss();
        EasyLoading.showSuccess('Tag deleted successfully');
        state = SubscriptionState.success();
      } else {
        EasyLoading.dismiss();
        EasyLoading.showError('failed');
        state = SubscriptionState.error(
            result.error ?? 'Failed to delete tag');
      }
    } catch (e) {
      EasyLoading.dismiss();
      EasyLoading.showError('failed');
      state = SubscriptionState.error('Error deleting tag: $e');
    }
  }
}

class SubscriptionState {
  final bool isLoading;
  final String? error;
  final bool success;

  SubscriptionState(
      {required this.isLoading, this.error, this.success = false});

  factory SubscriptionState.initial() => SubscriptionState(isLoading: false);
  factory SubscriptionState.loading() => SubscriptionState(isLoading: true);
  factory SubscriptionState.success() =>
      SubscriptionState(isLoading: false, success: true);
  factory SubscriptionState.error(String errorMessage) =>
      SubscriptionState(isLoading: false, error: errorMessage);
}
