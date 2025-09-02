import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ccn/models/user.dart';

final authProvider = ChangeNotifierProvider((ref) => AuthProvider());

class AuthProvider extends ChangeNotifier {
  final http = Dio(BaseOptions(
    baseUrl: "http://localhost:3000",
    contentType: "application/json",
  ));

  User? user;
  bool isLoading = false;

  // logic for login
  Future<bool> login({required String email, required String password}) async {
    try {
      setState(() => isLoading = true);
      
      final response = await http.post("/api/auth/signin", data: {
        "email": email,
        "password": password,
      });

      if (response.statusCode == 200 && response.data["success"] == true) {
        final token = response.data["data"]["token"];
        await saveToken(token);
        user = User.fromJson(response.data["data"]);
        notifyListeners();
        return true;
      } else {
        return false;
      }
    } catch (err) {
      print('Login error: $err');
      return false;
    } finally {
      setState(() => isLoading = false);
    }
  }

  // logic for signing up
  Future<bool> register({required String email, required String username, required String phone, required String password}) async {
    try {
      setState(() => isLoading = true);
      
      final response = await http.post("/api/auth/signup", data: {
        "email": email,
        "username": username,
        "phone": phone,
        "password": password,
      });

      if (response.statusCode == 200 && response.data["success"] == true) {
        final token = response.data["token"];
        await saveToken(token);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      print('Register error: $err');
      return false;
    } finally {
      setState(() => isLoading = false);
    }
  }

  // logic for logging out
  Future logout() async {
    await deleteToken();
    user = null;
    notifyListeners();
  }

  // save token
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    String tk = 'Bearer $token';
    http.options.headers['Authorization'] = tk;
    await prefs.setString('token', token);
  }

  // remove token
  Future<void> deleteToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    http.options.headers.remove('Authorization');
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString("token");
  }

  void setState(VoidCallback fn) {
    fn();
    notifyListeners();
  }
}
