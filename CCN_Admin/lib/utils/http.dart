
// request status
import 'dart:async';

import 'package:ccn_admin/constant/end_point.dart';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';


enum Status { failed, successful, unauthorized }

final httpProvider = Provider((ref) => HttpProvider());

class HttpProvider {
  final http = Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    contentType: "application/json",
  ));
// save token
  void saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    String tk = 'Bearer $token';
    http.options.headers['Authorization'] = tk;
    await prefs.setString('token', token);
  }

// remove token
  Future deleteToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString("token");
  }

// Error handling
  FutureOr<Resp<dynamic>> handler({required Future Function() func}) async {
    try {
      final resp = await func.call();
      return Resp(status: Status.successful, data: resp.data);
    } catch (err) {
      if (err is DioException) {
        print('response: ${err.response!.data}');
        if (err.response != null) {
          String errorMessage = err.response!.data?['error']?.toString() ??
              err.response!.data?['data']?.toString() ??
              'Unknown error';
          return Resp(status: Status.failed, data: errorMessage);
        }
      }
      rethrow;
    }
  }
}

class Resp<T> {
  final Status status;
  final T? data;
  const Resp({required this.status, this.data});

  Resp<U?> parse<U>(U Function(dynamic data) parser) {
    if (data != null) {
      print(data);
      return Resp(
        status: Status.successful,
        data: parser(data),
      );
    }
    return const Resp(status: Status.failed, data: null);
  }

  static toNull() {
    return const Resp(status: Status.failed);
  }
}
