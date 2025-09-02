class SubscriptionPlan {
  final String id;
  final PlanDetails planDetails;
  final String cycle;
  final DateTime createdAt;
  final DateTime updatedAt;

  SubscriptionPlan({
    required this.id,
    required this.planDetails,
    required this.cycle,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SubscriptionPlan.fromJson(Map<String, dynamic> json) {
    return SubscriptionPlan(
      id: json['_id'] ?? '', // Handle null or missing values
      planDetails: PlanDetails.fromJson(json['planDetails'] ?? {}),
      cycle: json['cycle'] ?? '',
      createdAt: DateTime.parse(json['createdAt'] ?? ''),
      updatedAt: DateTime.parse(json['updatedAt'] ?? ''),
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is SubscriptionPlan &&
        other.id == id &&
        other.planDetails == planDetails &&
        other.cycle == cycle &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        planDetails.hashCode ^
        cycle.hashCode ^
        createdAt.hashCode ^
        updatedAt.hashCode;
  }
}

class PlanDetails {
  final String type;
  final double price;

  PlanDetails({
    required this.type,
    required this.price,
  });

  factory PlanDetails.fromJson(Map<String, dynamic> json) {
    return PlanDetails(
      type: json['type'] ?? '', // Handle null or missing values
      price: (json['price'] as num?)?.toDouble() ??
          0.0, // Handle null or missing values
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is PlanDetails && other.type == type && other.price == price;
  }

  @override
  int get hashCode {
    return type.hashCode ^ price.hashCode;
  }
}
