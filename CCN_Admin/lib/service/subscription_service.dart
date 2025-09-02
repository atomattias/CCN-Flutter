import 'dart:async';

import 'package:ccn_admin/constant/end_point.dart';
import 'package:ccn_admin/models/subscription_model.dart';
import 'package:ccn_admin/models/tags_model.dart';
import 'package:ccn_admin/screens/subscription.dart';
import 'package:ccn_admin/utils/enums_result.dart';
import 'package:ccn_admin/utils/http.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SubscriptionProvider extends ChangeNotifier {
  late Ref ref;
  late Dio http;
  late HttpProvider prov;
  Subscription? subscriptions;

  SubscriptionProvider(this.ref) {
    init();
  }

  init() {
    prov = ref.read(httpProvider);
    http = prov.http;
  }

Stream<Result<List<SubscriptionPlan>>> fetchSubscriptions() async* {
    final controller = StreamController<Result<List<SubscriptionPlan>>>();

    try {
      final resp = await prov.handler(
        func: () => http.get(
            ApiConstants.getAllSubscriptionsUrl), // Adjust the URL as needed
      );

      if (resp.status == Status.successful) {
        List<dynamic> data = resp.data['data'];
        print(data);
        List<SubscriptionPlan> subscriptions = data
            .map<SubscriptionPlan>((json) => SubscriptionPlan.fromJson(json))
            .toList();
        controller.add(Result.success(subscriptions));
        print(subscriptions);
      } else {
        controller.add(Result.failure(resp.data));
      }
    } catch (e) {
      controller.add(Result.failure(e.toString()));
    } finally {
      controller.close();
    }

    yield* controller.stream;
  }


  Future<Result<void>> deleteSubscription(String subscriptionId) async {
    try {
      final String? token = await prov.getToken();

      if (token == null) {
        return Result.failure("Token is null");
      }

      final resp = await prov.handler(
        func: () => http.delete(
          '${ApiConstants.deleteSubscription}$subscriptionId',
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

  Future<Result<void>> editSubscription(
      {required subscriptionId,
      required Map<String, dynamic> subscriptionData}) async {
    try {
      final String? token = await prov.getToken();

      if (token == null) {
        return Result.failure("Token is null");
      }

      print(token);

      final resp = await prov.handler(
        func: () => http.put(
          '${ApiConstants.updateSubscription}$subscriptionId',
          data: subscriptionData,
          options: Options(
            headers: {
              "Authorization": "Bearer $token",
              'Content-Type': 'application/json',
            },
          ),
        ),
      );

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

// ADD SUBSCRIPTION

Future<Result<void>> createSubscription(
      Map<String, dynamic> subscriptionData) async {
    try {
      final String? token = await prov.getToken();

      if (token == null) {
        return Result.failure("Token is null");
      }

      final resp = await prov.handler(
        func: () => http.post(
          ApiConstants.createSubscription,
          data: subscriptionData,
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


  // GET ALL TAGS
 Stream<Result<List<Tag>>> fetchTags() async* {
    final controller = StreamController<Result<List<Tag>>>();

    try {
      final resp = await prov.handler(
        func: () => http.get(
          ApiConstants.getAllTagsUrl,
        ),
      );

      if (resp.status == Status.successful) {
        List<dynamic> data = resp.data['data'];
        print(data);
        List<Tag> tags = data.map<Tag>((json) => Tag.fromJson(json)).toList();
        controller.add(Result.success(tags));
      } else {
        print(resp.data);
        controller.add(Result.failure(resp.data));
      }
    } catch (e) {
      print(e);
      controller.add(Result.failure(e.toString()));
    } finally {
      controller.close();
    }

    yield* controller.stream;
  }


  Future<Result<void>> addTag(Map<String, dynamic> tagData) async {
  try {
    final String? token = await prov.getToken();

    if (token == null) {
      return Result.failure("Token is null");
    }

    final resp = await prov.handler(
      func: () => http.post(
        ApiConstants.addTagUrl,
        data: tagData,
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

Future<Result<void>> editTag(Map<String, dynamic> tagData) async {
  try {
    final String? token = await prov.getToken();

    if (token == null) {
      return Result.failure("Token is null");
    }

    final resp = await prov.handler(
      func: () => http.put(
        ApiConstants.editTagUrl,
        data: tagData,
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


Future<Result<void>> deleteTag(String tagId) async {
  try {
    final String? token = await prov.getToken();

    if (token == null) {
      return Result.failure("Token is null");
    }

    final resp = await prov.handler(
      func: () => http.delete(
        '${ApiConstants.deleteTagUrl}/$tagId',
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
