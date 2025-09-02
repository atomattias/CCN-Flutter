import 'package:ccn_admin/screens/dashboard.dart';
import 'package:ccn_admin/utils/routes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return  MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'CCN',
      home:const DashBoard(),
      initialRoute: AppRoutes.signIn,
      onGenerateRoute: AppRoute.generateRoute,
       builder: EasyLoading.init(),
    );
  }
}
