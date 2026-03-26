#include <stdio.h>
#include <windows.h>
#include "ViGEmClient.h"

int main(void)
{
    PVIGEM_CLIENT client = vigem_alloc();
    if (client == NULL)
    {
        printf("فشل في إنشاء العميل\n");
        return -1;
    }

    VIGEM_ERROR err = vigem_connect(client);
    if (!VIGEM_SUCCESS(err))
    {
        printf("لم يتم الاتصال بـ ViGEmBus\n");
        vigem_free(client);
        return -1;
    }

    PVIGEM_TARGET pad = vigem_target_x360_alloc();
    err = vigem_target_add(client, pad);
    if (!VIGEM_SUCCESS(err))
    {
        printf("فشل في إنشاء يد Xbox الافتراضية\n");
        vigem_disconnect(client);
        vigem_free(client);
        return -1;
    }

    // اضغط زر A
    XUSB_REPORT report;
    XUSB_REPORT_INIT(&report);
    report.wButtons = XUSB_GAMEPAD_A;
    vigem_target_x360_update(client, pad, report);

    printf("زر A مضغوط...\n");
    Sleep(1000);

    // ارفع الزر
    XUSB_REPORT_INIT(&report);
    vigem_target_x360_update(client, pad, report);
    printf("تم رفع الزر.\n");

    // إزالة الجهاز
    vigem_target_remove(client, pad);
    vigem_target_free(pad);
    vigem_disconnect(client);
    vigem_free(client);

    return 0;
}
