import 'dart:async';

import 'package:ccn_admin/constant/end_point.dart';
import 'package:ccn_admin/models/channels_model.dart';
import 'package:ccn_admin/models/user_model.dart';
import 'package:ccn_admin/utils/enums_result.dart';
import 'package:ccn_admin/utils/http.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ChannelModelsProvider extends ChangeNotifier {
  late Ref ref;
  late Dio http;
  late HttpProvider prov;
  ChannelModel? ChannelModels;
  List<User> users = []; 

  ChannelModelsProvider(this.ref) {
    init();
  }

  init() {
    prov = ref.read(httpProvider);
    http = prov.http;
  }

  Stream<Result<List<ChannelModel>>> fetchChannelModels() async* {
    final controller = StreamController<Result<List<ChannelModel>>>();
    print('=======IN ChannelModelS=======');
    final String? token = await prov.getToken();

    if (token == null) {
      // Handle the case where the token is null
      yield Result.failure("Token is null");
      return;
    }

    try {
      final resp = await prov.handler(
        func: () => http.get(
          ApiConstants.allChannels,
          options: Options(
            headers: {
              "Authorization": "Bearer $token",
              'Content-Type': 'application/json',
            },
          ),
        ),
      );

      if (resp.status == Status.successful) {
        print('======PRINTING DATA==========');
        List<dynamic> data = resp.data;
        print(data);
        List<ChannelModel> channelModels = data
            .map<ChannelModel>((json) => ChannelModel.fromJson(json))
            .toList();
        controller.add(Result.success(channelModels));
        print('===FINSIH====');
      } else {
        controller.add(Result.failure(resp.data));
      }
    } catch (e) {
      controller.add(Result.failure(e.toString()));
    } finally {
      controller.close(); // Don't forget to close the stream controller
    }
    yield* controller.stream;
  }

  Future<Result<void>> addChannelModel(
      {required Map<String, dynamic> data}) async {
    print('====DATA IS PRINTING');
    print(data);
    try {
      final String? token = await prov.getToken();
      print(token);

      if (token == null) {
        return Result.failure("Token is null");
      }
      final resp = await prov.handler(
        func: () => http.post(
          ApiConstants.addChannel,
          data: data,
          options: Options(
            headers: {
              "Authorization": "Bearer $token",
              'Content-Type': 'application/json',
            },
          ),
        ),
      );
      print( ApiConstants.addChannel,);
      if (resp.status == Status.successful) {
        print('it works');
        return Result.success(null);
      } else {
        return Result.failure(resp.data);
      }
    } catch (e) {
      return Result.failure(e.toString());
    }
  }

Future<void> getAllUsers() async {
  final String? token = await prov.getToken();
  try {
    final resp = await prov.handler(
      func: () => http.get(ApiConstants.allUsers,
          options: Options(
            headers: {
              "Authorization": "Bearer $token",
              'Content-Type': 'application/json',
            },
          )),
    );

    if (resp.status == Status.successful) {
       final List<dynamic> usersData = resp.data['data'];
        users = usersData.map((userData) => User.fromJson(userData)).toList();
        notifyListeners();
      
    } else {
      throw Exception('Failed to load user: ${resp.status}');
    }
  } catch (e) {
    throw Exception('Failed to load user: $e');
  }
}


Future<Result<void>> addUsersToChannel({required String channelID, required List<String> userIds}) async {
  try {
    final String? token = await prov.getToken();
    if (token == null) {
      return Result.failure("Token is null");
    }
    final resp = await prov.handler(
      func: () => http.put(
        ApiConstants.addUsers,
        data: {
          "id": channelID,
          "users": userIds,
        },
        options: Options(
          headers: {
            "Authorization": "Bearer $token",
            'Content-Type': 'application/json',
          },
        ),
      ),
    );
    if (resp.status == Status.successful) {
      return Result.success(null);
    } else {
      return Result.failure(resp.data);
    }
  } catch (e) {
    return Result.failure(e.toString());
  }
}

Future<Result<void>> removeUserFromChannel({
  required String channelId,
  required String userId,
}) async {
  try {
    final String? token = await prov.getToken();
    if (token == null) {
      return Result.failure("Token is null");
    }
    final resp = await prov.handler(
      func: () => http.delete(
        ApiConstants.addUsers,
        data: {
          'id': channelId,
          'user': userId,
        },
        options: Options(
          headers: {
            "Authorization": "Bearer $token",
            'Content-Type': 'application/json',
          },
        ),
      ),
    );
    if (resp.status == Status.successful) {
      return Result.success(null);
    } else {
      return Result.failure(resp.data);
    }
  } catch (e) {
    return Result.failure(e.toString());
  }
}


 Future<Result<void>> changeChannelStatus({required String channelId, required bool disabled}) async {
    try {
      final String? token = await prov.getToken();

      if (token == null) {
        return Result.failure("Token is null");
      }

      final resp = await prov.handler(
        func: () => http.put(
          ApiConstants.updateChannelStatus,
          data: {'disable': disabled,'id':channelId},
          options: Options(
            headers: {
              "Authorization": "Bearer $token",
              'Content-Type': 'application/json',
            },
          ),
        ),
      );

      if (resp.status == Status.successful) {
        return Result.success(null);
      } else {
        return Result.failure(resp.data);
      }
    } catch (e) {
      return Result.failure(e.toString());
    }
  }



}
