import 'package:ccn_admin/models/user_model.dart';
import 'package:ccn_admin/provider/provider.dart';
import 'package:ccn_admin/service/auth.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class UserController extends StateNotifier<User?> {
  final Ref ref;
  final AuthProvider _authProvider;
  UserController(this.ref, this._authProvider) : super(null);

  void setUser(User user) {
    state = user;
  }

  void clearUser() {
    state = null;
  }


   Future<bool> verifyUser(String userID) async {
    try {
      // Call the verifyUser method from AuthProvider
      final bool verified = await ref.read(authProvider).verifyUser(userID: userID);

      if (verified) {
          
        return true;
      } else {
        // Verification failed, handle accordingly
        return false;
      }
    } catch (e) {
      // Handle error
      print('Error verifying user: $e');
      return false;
    }
  }

  Future<bool> changeUserRole(String userID, String newRole) async {
    if (!_authProvider.isSuperUser()) {
      print('Not allowed: Current user is not a superuser');
      EasyLoading.showError('Current user is not a superuser');
      return false;
    }
    EasyLoading.show(status: 'changing status');
    try {
      final bool roleChanged = await ref.read(authProvider).changeUserRole(userID: userID, newRole: newRole);
      if (roleChanged) {
        if (state != null) {
          state = state!.copyWith(role: newRole);
         
        }
         EasyLoading.dismiss();
          EasyLoading.showSuccess('success');
        return true;
      } else {
         EasyLoading.dismiss();
        EasyLoading.showError('failed');
        return false;
      }

    } catch (e) {
        EasyLoading.dismiss();
        EasyLoading.showError('failed');
      print('Error changing user role: $e');
      return false;
    }
  }
}




