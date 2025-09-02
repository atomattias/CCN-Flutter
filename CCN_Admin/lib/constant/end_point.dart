class ApiConstants {
  static const String baseUrl = 'http://localhost:3000';
  static const String loginUrl = '$baseUrl/api/auth/signin';
  static String get getAllSubscriptionsUrl => '$baseUrl/api/subscription/';
  static String get updateSubscription => '$baseUrl/api/admin/subscription/';
  static String get deleteSubscription => '$baseUrl/api/admin/subscription/';
  static String get createSubscription =>
      '$baseUrl/api/admin/create-subscription';
  static String get allChannels => '$baseUrl/api/admin/channels';
  static String get addChannel => '$baseUrl/api/chat/create-channel/';
  static String get allUsers => '$baseUrl/api/admin/users';
  static String get addUsers => '$baseUrl/api/chat/channel/users';
  static String get verifyUsers => '$baseUrl/api/admin/verify-account';
  static String get changeRole => '$baseUrl/api/user/change-role';
  static String get getAllTagsUrl => '$baseUrl/api/admin/tags';
  static String get addTagUrl=> '$baseUrl/api/admin/create-tag';
  static String get editTagUrl=> '$baseUrl/api/admin/update-tag';
  static String get deleteTagUrl=> '$baseUrl/api/admin/delete-tag';
  static String get updateChannelStatus=> '$baseUrl/api/admin/channel/change-status';
}
