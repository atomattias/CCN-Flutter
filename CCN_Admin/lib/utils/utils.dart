import "package:intl/intl.dart";

String formatDate(String timestamp) {
  DateTime dateTime = DateTime.parse(timestamp);
  String formattedTime =
      DateFormat("MMM d, yyyy : h:mma").format(dateTime.toLocal());
  return formattedTime;
}
