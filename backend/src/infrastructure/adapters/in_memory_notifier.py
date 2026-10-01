# backend/src/infrastructure/adapters/in_memory_notifier.py


from typing import Dict, List
from src.domain.ports.notifier import NotifierPort

class InMemoryNotifier(NotifierPort):
    def __init__(self) -> None:
        self.sent_messages: List[Dict[str, str]] = []

    def send_sms(self, phone_number: str, message: str) -> bool:
        self.sent_messages.append({"phone": phone_number, "message": message})
        return True