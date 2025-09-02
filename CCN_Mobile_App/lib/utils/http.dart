import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// request status
enum Status { failed, successful }

final httpProvider = Provider((ref) => HttpProvider());

const String baseUrl = "http://localhost:3000";
// const String baseUrl = "https://cnn-server.onrender.com";

class HttpProvider {
  final http = Dio(BaseOptions(
    baseUrl: baseUrl,
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
        print('response: ${err.response}');
        if (err.response != null) {
          final resp = err.response;
          final message = resp!.data["message"];
          return Resp(status: Status.failed, data: message);
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
