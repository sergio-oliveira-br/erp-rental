# backend/src/domain/ports/notifier.py

from abc import ABC, abstractmethod

class NotifierPort(ABC):
    @abstractmethod
    def send_sms(self, phone_number: str, message: str) -> bool:
        pass