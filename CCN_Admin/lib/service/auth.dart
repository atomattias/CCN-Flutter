import 'package:ccn_admin/constant/end_point.dart';
import 'package:ccn_admin/models/user_model.dart';
import 'package:ccn_admin/provider/provider.dart';
import 'package:ccn_admin/utils/http.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AuthProvider extends ChangeNotifier {
  late Ref ref;
  late Dio http;
  User? user;
  late HttpProvider prov;
  AuthProvider(this.ref) {
    init();
  }

  init() {
    prov = ref.read(httpProvider);
    http = prov.http;
  }

// CHECK IF USER IS ADMIN
  bool isSuperUser() {
    return user?.role == 'SUPERUSER';
  }

//login
  Future<bool> login({email, password}) async {
    print(email);
    print(password);
    try {
      final resp = await prov.handler(
        func: () => http.post(ApiConstants.loginUrl,
            data: {"email": email, "password": password, "role": "ADMIN"}),
      );
      if (resp.status == Status.successful) {
        prov.saveToken(resp.data["data"]["token"]);
        user = User.fromJson(resp.data["data"]);
        print(resp.data['data']);
        ref.read(userControllerProvider.notifier).setUser(user!);

        print(user);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      print('====== PRINTING USER========');
      print(email);
      print(password);
      print('Error during login: $e');
      return false;
    }
  }

  Future<bool> verifyUser({required String userID}) async {
    EasyLoading.show(status: "Verifying user!", dismissOnTap: false);
    try {
      final String? token = await prov.getToken();
      if (token == null) {
        print('user null');
      }
      final resp = await prov.handler(
        func: () => http.put(
          ApiConstants.verifyUsers,
          data: {"userId": userID},
          options: Options(
            headers: {
              "Authorization": "Bearer $token",
              'Content-Type': 'application/json',
            },
          ),
        ),
      );

      if (resp.status == Status.successful) {
        EasyLoading.dismiss();
        EasyLoading.showSuccess('user varified');
        return true;
      } else {
        EasyLoading.dismiss();
        EasyLoading.showError('Failed');
        return false;
      }
    } catch (e) {
      EasyLoading.dismiss();
      EasyLoading.showError('Failed');
      print('Error during user verification: $e');
      return false;
    }
  }

  Future<bool> changeUserRole(
      {required String userID, required String newRole}) async {
    EasyLoading.show(status: "Changing user role!", dismissOnTap: false);
    try {
      final String? token = await prov.getToken();
      if (token == null) {
        print('user null');
      }
      final resp = await prov.handler(
        func: () => http.put(
          ApiConstants.changeRole,
          data: {"userId": userID, "role": newRole},
          options: Options(
            headers: {
              "Authorization": "Bearer $token",
              'Content-Type': 'application/json',
            },
          ),
        ),
      );

      if (resp.status == Status.successful) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      EasyLoading.dismiss();
      EasyLoading.showError('Failed to change role');
      print('Error during user role change: $e');
      return false;
    }
  }
}
