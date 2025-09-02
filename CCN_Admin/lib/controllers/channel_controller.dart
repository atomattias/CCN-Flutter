// ignore_for_file: use_build_context_synchronously

import 'package:ccn_admin/models/user_model.dart';
import 'package:ccn_admin/provider/provider.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ChannelController extends StateNotifier<ChannelState> {
  final Ref ref;

  ChannelController(this.ref) : super(ChannelState.initial());

  Future<void> createChannel({required Map<String, dynamic> channel}) async {
    print(channel);
    print('subscription');
    try {
      state = ChannelState.loading();
      final result = await ref.read(channelProvider).addChannelModel(data: channel);
      if (result.isSuccess) {
        state = ChannelState.success();
        ref.read(channelProvider).fetchChannelModels();
      } else {
        state = ChannelState.error(result.error ?? 'Failed to add channel');
      }
    } catch (e) {
      state = ChannelState.error('Error deleting subscription: $e');
    }
  }

  Future<void> addUserToChannel({required String channelID, required List<String> userIds}) async {
  EasyLoading.show(status: "Adding user",dismissOnTap: false);
  print('Adding users to channel');
  try {
    final result = await ref.read(channelProvider).addUsersToChannel(channelID: channelID, userIds: userIds);
    if (result.isSuccess) {
      print('Users added successfully');
      EasyLoading.dismiss();
      EasyLoading.showSuccess('User added successfully');
    } else {
      EasyLoading.dismiss();
      EasyLoading.showError('Failed');
      print('Failed to add users to channel: ${result.error}');
    }
  } catch (e) {
     EasyLoading.dismiss();
      EasyLoading.showError('Failed');
    print('Error adding users to channel: $e');
  }
}


Future<void> removeUserFromChannel({required String channelID, required String userID}) async {
   EasyLoading.show(status: 'removing user');
   Future.delayed(Duration(seconds: 3));
    print('Deleting user from channel');
    try {
      final result = await ref.read(channelProvider).removeUserFromChannel(channelId: channelID, userId: userID);
      if (result.isSuccess) {
        print('User deleted successfully from channel');
        EasyLoading.dismiss();
        EasyLoading.showSuccess('User deleted successfully from channel');
        // Perform any necessary actions after deleting the user from the channel
      } else {
        EasyLoading.dismiss();
        EasyLoading.showError('failed');
        print('Failed to delete user from channel: ${result.error}');
        // Handle error, display error message, etc.
      }
    } catch (e) {
      print('Error deleting user from channel: $e');
      // Handle error, display error message, etc.
    }
  }


  Future<void> changeChannelStatus({ required bool disabled,required String channelID}) async {
    EasyLoading.show(status: disabled ? 'Disabling channel' : 'Enabling channel');
    print('${disabled ? 'Disabling' : 'Enabling'} channel');
    try {
      final result = await ref.read(channelProvider).changeChannelStatus(channelId: channelID,disabled: disabled);
      if (result.isSuccess) {
        print('Channel status changed successfully');
        EasyLoading.dismiss();
        EasyLoading.showSuccess('Channel status changed successfully');
      } else {
        EasyLoading.dismiss();
        EasyLoading.showError('Failed to change channel status');
        print('Failed to change channel status: ${result.error}');
        // Handle error, display error message, etc.
      }
    } catch (e) {
      EasyLoading.dismiss();
      EasyLoading.showError('Failed to change channel status');
      print('Error changing channel status: $e');
      // Handle error, display error message, etc.
    }
  }

}




class ChannelState {
  final bool isLoading;
  final String? error;
  final bool success;
  final List<User>? users;

   ChannelState({required this.isLoading, this.error, this.success = false, this.users});

  factory ChannelState.initial() => ChannelState(isLoading: false);
  factory ChannelState.loading() => ChannelState(isLoading: true);
  factory ChannelState.success() =>
      ChannelState(isLoading: false, success: true);
  factory ChannelState.error(String errorMessage) =>
      ChannelState(isLoading: false, error: errorMessage);
  factory ChannelState.usersLoaded(List<User> users) => ChannelState(isLoading: false, users: users);
}