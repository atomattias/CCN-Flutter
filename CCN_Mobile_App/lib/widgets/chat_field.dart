part of widgets;

class ChatField extends ConsumerWidget {
  final Function(String) onSendMessage;
  final ScrollController? controller;
  ChatField({Key? key, required this.onSendMessage, this.controller})
      : super(key: key);

  final TextEditingController textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  void scrollDown() {
    SchedulerBinding.instance.addPostFrameCallback((_) {
      controller!.jumpTo(controller!.position.maxScrollExtent);
    });
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appTheme = AppTheme.appTheme(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: TextField(
          focusNode: _focusNode,
          controller: textController,
          decoration: InputDecoration(
            contentPadding: EdgeInsets.zero,
            prefixIcon: IconButton(
              onPressed: () {},
              icon: const Icon(CupertinoIcons.smiley),
            ),
            suffixIcon: IconButton(
              onPressed: () {
                if (textController.text.isNotEmpty) {
                  onSendMessage(textController.text);
                  scrollDown;
                }
              },
              icon: Icon(
                Icons.send,
                color: appTheme.primary,
              ),
            ),
            hintText: "Type something...",
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(60.0),
                borderSide: BorderSide(
                  width: 2,
                  color: appTheme.primary,
                )),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(60.0),
              borderSide: BorderSide(
                width: 2,
                color: appTheme.primary.withOpacity(.5),
              ),
            ),
          ),
          onChanged: (value) {
            // Implement typing event
          },
          onSubmitted: (message) {
            if (message.isNotEmpty) {
              onSendMessage(message);
              scrollDown;
            }
          }),
    );
  }
}
