// exports an instance of LoginController
import 'package:ccn_admin/controllers/channel_controller.dart';
import 'package:ccn_admin/controllers/login_controller.dart';
import 'package:ccn_admin/controllers/subscription_controller.dart';
import 'package:ccn_admin/controllers/user_controller.dart';
import 'package:ccn_admin/models/user_model.dart';
import 'package:ccn_admin/service/auth.dart';
import 'package:ccn_admin/service/channels_service.dart';
import 'package:ccn_admin/service/subscription_service.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final authProvider = ChangeNotifierProvider((ref) => AuthProvider(ref));

final userControllerProvider =
    StateNotifierProvider<UserController, User?>((ref) {
      final auth = ref.read(authProvider);
  return UserController(ref,auth);
});

final loginControllerProvider =
    StateNotifierProvider<LoginController, LoginState>((ref) {
  return LoginController(ref);
});

final subscriptionProvider =
    ChangeNotifierProvider((ref) => SubscriptionProvider(ref));

final channelProvider = ChangeNotifierProvider((ref) => ChannelModelsProvider(ref));

final subscriptionControllerProvider =
    StateNotifierProvider<SubscriptionController, SubscriptionState>((ref) {
  return SubscriptionController(ref);
});

final channelControllerProvider =
    StateNotifierProvider<ChannelController, ChannelState>((ref) {
  return ChannelController(ref);
});



