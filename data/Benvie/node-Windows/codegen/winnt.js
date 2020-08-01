var api = require('windows/api');

var
 CallbackT = api.CallbackT,
 StructT = api.StructT,
 Library = api.Library,
 ArrayT = api.ArrayT,
 EnumT = api.EnumT,
 NULL = api.NULL

var
 _void     = api('void'),
 int8      = api('int8'),
 uint8     = api('uint8'),
 int16     = api('int16'),
 uint16    = api('uint16'),
 int32     = api('int32'),
 uint32    = api('uint32'),
 int64     = api('int64'),
 uint64    = api('uint64'),
 float     = api('float'),
 double    = api('double'),
 CString   = api('CString'),
 WString   = api('WString'),
 bool      = api('bool'),
 byte      = api('byte'),
 char      = api('char'),
 uchar     = api('uchar'),
 short     = api('short'),
 ushort    = api('ushort'),
 int       = api('int'),
 uint      = api('uint'),
 long      = api('long'),
 ulong     = api('ulong'),
 longlong  = api('longlong'),
 ulonglong = api('ulonglong'),
 size_t    = api('size_t'),
 charΔ     = api('charΔ'),
 voidΔ     = api('voidΔ'),
 intΔ      = api('intΔ'),
 NULL      = api('NULL'),
 VoidT     = api('VoidT');

var
 DWORD = ulong.typedef('DWORD'),
 BYTE = uchar.typedef('BYTE'),
 WORD = ushort.typedef('WORD'),
 PDWORD = ulong.Δ.typedef('PDWORD'),
 ULONG_PTR = ulong.typedef('ULONG_PTR'),
 SIZE_T = ulong.typedef('SIZE_T'),
 DWORD64 = ulonglong.typedef('DWORD64'),
 KAFFINITY = ulong.typedef('KAFFINITY'),
 PVOID = _void.Δ.typedef('PVOID'),
 PVOID64 = _void.Δ.typedef('PVOID64'),
 CHAR = char.typedef('CHAR'),
 SHORT = short.typedef('SHORT'),
 LONG = long.typedef('LONG'),
 WCHAR = ushort.typedef('WCHAR'),
 PCWSTR = ushort.Δ.typedef('PCWSTR'),
 HANDLE = _void.Δ.typedef('HANDLE'),
 LONGLONG = longlong.typedef('LONGLONG'),
 ULONGLONG = ulonglong.typedef('ULONGLONG'),
 BOOLEAN = uchar.typedef('BOOLEAN'),
 PACCESS_TOKEN = _void.Δ.typedef('PACCESS_TOKEN'),
 PSECURITY_DESCRIPTOR = _void.Δ.typedef('PSECURITY_DESCRIPTOR'),
 PSID = _void.Δ.typedef('PSID'),
 ACCESS_MASK = ulong.typedef('ACCESS_MASK'),
 PACCESS_MASK = ulong.Δ.typedef('PACCESS_MASK'),
 SID_HASH_ENTRY = ulong.typedef('SID_HASH_ENTRY'),
 SECURITY_DESCRIPTOR_CONTROL = ushort.typedef('SECURITY_DESCRIPTOR_CONTROL'),
 ACCESS_REASON = ulong.typedef('ACCESS_REASON'),
 SECURITY_CONTEXT_TRACKING_MODE = uchar.typedef('SECURITY_CONTEXT_TRACKING_MODE'),
 TP_VERSION = ulong.typedef('TP_VERSION');

var SID_NAME_USE = new EnumT('SID_NAME_USE', {
 TypeUser: 1,
 TypeGroup: 1,
 TypeDomain: 2,
 TypeAlias: 3,
 TypeWellKnownGroup: 4,
 TypeDeletedAccount: 5,
 TypeInvalid: 6,
 TypeUnknown: 7,
 TypeComputer: 8,
 TypeLabel: 9
});

var WELL_KNOWN_SID_TYPE = new EnumT('WELL_KNOWN_SID_TYPE', {
 WinNullSid: 0,
 WinWorldSid: 1,
 WinLocalSid: 2,
 WinCreatorOwnerSid: 3,
 WinCreatorGroupSid: 4,
 WinCreatorOwnerServerSid: 5,
 WinCreatorGroupServerSid: 6,
 WinNtAuthoritySid: 7,
 WinDialupSid: 8,
 WinNetworkSid: 9,
 WinBatchSid: 10,
 WinInteractiveSid: 11,
 WinServiceSid: 12,
 WinAnonymousSid: 13,
 WinProxySid: 14,
 WinEnterpriseControllersSid: 15,
 WinSelfSid: 16,
 WinAuthenticatedUserSid: 17,
 WinRestrictedCodeSid: 18,
 WinTerminalServerSid: 19,
 WinRemoteLogonSid: 20,
 WinLogonIdsSid: 21,
 WinLocalSystemSid: 22,
 WinLocalServiceSid: 23,
 WinNetworkServiceSid: 24,
 WinBuiltinDomainSid: 25,
 WinBuiltinAdministratorsSid: 26,
 WinBuiltinUsersSid: 27,
 WinBuiltinGuestsSid: 28,
 WinBuiltinPowerUsersSid: 29,
 WinBuiltinAccountOperatorsSid: 30,
 WinBuiltinSystemOperatorsSid: 31,
 WinBuiltinPrintOperatorsSid: 32,
 WinBuiltinBackupOperatorsSid: 33,
 WinBuiltinReplicatorSid: 34,
 WinBuiltinPreWindows2000CompatibleAccessSid: 35,
 WinBuiltinRemoteDesktopUsersSid: 36,
 WinBuiltinNetworkConfigurationOperatorsSid: 37,
 WinAccountAdministratorSid: 38,
 WinAccountGuestSid: 39,
 WinAccountKrbtgtSid: 40,
 WinAccountDomainAdminsSid: 41,
 WinAccountDomainUsersSid: 42,
 WinAccountDomainGuestsSid: 43,
 WinAccountComputersSid: 44,
 WinAccountControllersSid: 45,
 WinAccountCertAdminsSid: 46,
 WinAccountSchemaAdminsSid: 47,
 WinAccountEnterpriseAdminsSid: 48,
 WinAccountPolicyAdminsSid: 49,
 WinAccountRasAndIasServersSid: 50,
 WinNtlmAuthenticationSid: 51,
 WinDigestAuthenticationSid: 52,
 WinChannelAuthenticationSid: 53,
 WinThisOrganizationSid: 54,
 WinOtherOrganizationSid: 55,
 WinBuiltinIncomingForestTrustBuildersSid: 56,
 WinBuiltinPerfMonitoringUsersSid: 57,
 WinBuiltinPerfLoggingUsersSid: 58,
 WinBuiltinAuthorizationAccessSid: 59,
 WinBuiltinTerminalServerLicenseServersSid: 60,
 WinBuiltinDcomUsersSid: 61,
 WinBuiltinUsersSid: 62,
 WinUserSid: 63,
 WinBuiltinCryptoOperatorsSid: 64,
 WinUntrustedLabelSid: 65,
 WinLowLabelSid: 66,
 WinMediumLabelSid: 67,
 WinHighLabelSid: 68,
 WinSystemLabelSid: 69,
 WinWriteRestrictedCodeSid: 70,
 WinCreatorOwnerRightsSid: 71,
 WinCacheablePrincipalsGroupSid: 72,
 WinNonCacheablePrincipalsGroupSid: 73,
 WinEnterpriseReadonlyControllersSid: 74,
 WinAccountReadonlyControllersSid: 75,
 WinBuiltinEventLogReadersGroup: 76,
 WinNewEnterpriseReadonlyControllersSid: 77,
 WinBuiltinCertSvcComAccessGroup: 78,
 WinMediumPlusLabelSid: 79,
 WinLocalLogonSid: 80,
 WinConsoleLogonSid: 81,
 WinThisOrganizationCertificateSid: 82
});

var ACL_INFORMATION_CLASS = new EnumT('ACL_INFORMATION_CLASS', {
 RevisionInformation: 1,
 SizeInformation: 1
});

var AUDIT_EVENT_TYPE = new EnumT('AUDIT_EVENT_TYPE', {
 ObjectAccess: 0,
 DirectoryServiceAccess: 1
});

var ACCESS_REASON_TYPE = new EnumT('ACCESS_REASON_TYPE', {
 None: 0x00000000,
 AllowedAce: 0x00010000,
 DeniedAce: 0x00020000,
 AllowedParentAce: 0x00030000,
 DeniedParentAce: 0x00040000,
 MissingPrivilege: 0x00100000,
 FromPrivilege: 0x00200000,
 IntegrityLevel: 0x00300000,
 Ownership: 0x00400000,
 NullDacl: 0x00500000,
 EmptyDacl: 0x00600000,
 NoSd: 0x00700000,
 NoGrant: 0x00800000
});

var SECURITY_IMPERSONATION_LEVEL = new EnumT('SECURITY_IMPERSONATION_LEVEL', {
 Anonymous: 0,
 Identification: 1,
 Impersonation: 2,
 Delegation: 3
});

var TOKEN_TYPE = new EnumT('TOKEN_TYPE', {
 Primary: 1,
 Impersonation: 1
});

var TOKEN_ELEVATION_TYPE = new EnumT('TOKEN_ELEVATION_TYPE', {
 Default: 1,
 Full: 1,
 Limited: 2
});

var TOKEN_INFORMATION_CLASS = new EnumT('TOKEN_INFORMATION_CLASS', {
 User: 1,
 Groups: 1,
 Privileges: 2,
 Owner: 3,
 PrimaryGroup: 4,
 DefaultDacl: 5,
 Source: 6,
 Type: 7,
 ImpersonationLevel: 8,
 Statistics: 9,
 RestrictedSids: 10,
 SessionId: 11,
 GroupsAndPrivileges: 12,
 SessionReference: 13,
 SandBoxInert: 14,
 AuditPolicy: 15,
 Origin: 16,
 ElevationType: 17,
 LinkedToken: 18,
 Elevation: 19,
 HasRestrictions: 20,
 AccessInformation: 21,
 VirtualizationAllowed: 22,
 VirtualizationEnabled: 23,
 IntegrityLevel: 24,
 UiAccess: 25,
 MandatoryPolicy: 26,
 LogonSid: 27,
 MaxClass: 28
});

var MANDATORY_LEVEL = new EnumT('MANDATORY_LEVEL', {
 Untrusted: 0,
 Low: 1,
 Medium: 2,
 High: 3,
 System: 4,
 SecureProcess: 5,
 Count: 6
});

var HARDWARE_COUNTER_TYPE = new EnumT('HARDWARE_COUNTER_TYPE', {
 PmcCounter: 0,
 MaxType: 1
});

var JOBOBJECTINFOCLASS = new EnumT('JOBOBJECTINFOCLASS', {
 BasicAccountingInformation: 1,
 BasicLimitInformation: 1,
 BasicProcessIdList: 2,
 BasicUiRestrictions: 3,
 SecurityLimitInformation: 4,
 EndOfTimeInformation: 5,
 AssociateCompletionPortInformation: 6,
 BasicAndIoAccountingInformation: 7,
 ExtendedLimitInformation: 8,
 SetInformation: 9,
 GroupInformation: 10,
 MaxClass: 11
});

var LOGICAL_PROCESSOR_RELATIONSHIP = new EnumT('LOGICAL_PROCESSOR_RELATIONSHIP', {
 Core: 0,
 NumaNode: 1,
 Cache: 2,
 Package: 3,
 Group: 4,
 All: 0xffff
});

var PROCESSOR_CACHE_TYPE = new EnumT('PROCESSOR_CACHE_TYPE', {
 Unified: 0,
 Instruction: 1,
 Data: 2,
 Trace: 3
});

var SYSTEM_POWER_STATE = new EnumT('SYSTEM_POWER_STATE', {
 Unspecified: 0,
 Working: 1,
 Sleeping1: 2,
 Sleeping2: 3,
 Sleeping3: 4,
 Hibernate: 5,
 Shutdown: 6,
 Maximum: 7
});

var POWER_ACTION = new EnumT('POWER_ACTION', {
 None: 0,
 Reserved: 1,
 Sleep: 2,
 Hibernate: 3,
 Shutdown: 4,
 ShutdownReset: 5,
 ShutdownOff: 6,
 WarmEject: 7
});

var DEVICE_POWER_STATE = new EnumT('DEVICE_POWER_STATE', {
 Unspecified: 0,
 D0: 1,
 D1: 2,
 D2: 3,
 D3: 4,
 Maximum: 5
});

var MONITOR_DISPLAY_STATE = new EnumT('MONITOR_DISPLAY_STATE', {
 PowerOff: 0,
 PowerOn: 1,
 PowerDim: 2
});

var LATENCY_TIME = new EnumT('LATENCY_TIME', {
 LtDontCare: 0,
 LtLowestLatency: 1
});

var POWER_REQUEST_TYPE = new EnumT('POWER_REQUEST_TYPE', {
 DisplayRequired: 0,
 SystemRequired: 1,
 AwayModeRequired: 2
});

var POWER_INFORMATION_LEVEL = new EnumT('POWER_INFORMATION_LEVEL', {
 SystemPolicyAc: 0,
 SystemPolicyDc: 1,
 VerifySystemPolicyAc: 2,
 VerifySystemPolicyDc: 3,
 SystemCapabilities: 4,
 SystemBatteryState: 5,
 SystemStateHandler: 6,
 ProcessorStateHandler: 7,
 SystemPolicyCurrent: 8,
 AdministratorPolicy: 9,
 SystemReserveHiberFile: 10,
 ProcessorInformation: 11,
 SystemInformation: 12,
 ProcessorStateHandler2: 13,
 LastWakeTime: 14,
 LastSleepTime: 15,
 SystemExecutionState: 16,
 SystemStateNotifyHandler: 17,
 ProcessorPolicyAc: 18,
 ProcessorPolicyDc: 19,
 VerifyProcessorPolicyAc: 20,
 VerifyProcessorPolicyDc: 21,
 ProcessorPolicyCurrent: 22,
 SystemStateLogging: 23,
 SystemLoggingEntry: 24,
 SetSettingValue: 25,
 NotifyUserSetting: 26,
 Unused0: 27,
 Unused1: 28,
 SystemVideoState: 29,
 TraceApplicationMessage: 30,
 TraceApplicationMessageEnd: 31,
 ProcessorPerfStates: 32,
 ProcessorIdleStates: 33,
 ProcessorCap: 34,
 SystemWakeSource: 35,
 SystemHiberFileInformation: 36,
 TraceServiceMessage: 37,
 ProcessorLoad: 38,
 ShutdownNotification: 39,
 MonitorCapabilities: 40,
 SessionInit: 41,
 SessionDisplayState: 42,
 RequestCreate: 43,
 RequestAction: 44,
 GetRequestList: 45,
 ProcessorEx: 46,
 NotifyUserModeLegacyEvent: 47,
 GroupPark: 48,
 ProcessorIdleDomains: 49,
 WakeTimerList: 50,
 SystemHiberFileSize: 51,
 Maximum: 52
});

var SYSTEM_POWER_CONDITION = new EnumT('SYSTEM_POWER_CONDITION', {
 Ac: 0,
 Dc: 1,
 Hot: 2,
 Maximum: 3
});

var POWER_PLATFORM_ROLE = new EnumT('POWER_PLATFORM_ROLE', {
 Unspecified: 0,
 Desktop: 1,
 Mobile: 2,
 Workstation: 3,
 EnterpriseServer: 4,
 SohoServer: 5,
 AppliancePc: 6,
 PerformanceServer: 7,
 Maximum: 8
});

var IMAGE_AUX_SYMBOL_TYPE = new EnumT('IMAGE_AUX_SYMBOL_TYPE', {
 TokenDef: 1
});

var IMPORT_OBJECT_TYPE = new EnumT('IMPORT_OBJECT_TYPE', {
 Code: 0,
 Data: 1,
 Const: 2
});

var IMPORT_OBJECT_NAME_TYPE = new EnumT('IMPORT_OBJECT_NAME_TYPE', {
 Ordinal: 0,
 Name: 1,
 NoPrefix: 2,
 Undecorate: 3
});

var ReplacesCorHdrNumericDefines = new EnumT('ReplacesCorHdrNumericDefines', {
 ComimageFlagsIlonly: 0x00000001,
 ComimageFlags32bitrequired: 0x00000002,
 ComimageFlagsIlLibrary: 0x00000004,
 ComimageFlagsStrongnamesigned: 0x00000008,
 ComimageFlagsNativeEntrypoint: 0x00000010,
 ComimageFlagsTrackdebugdata: 0x00010000,
 VersionMajorV2: 2,
 VersionMajor: 7,
 VersionMinor: 0,
 DeletedNameLength: 8,
 VtablegapNameLength: 8,
 NativeTypeMaxCb: 1,
 IlmethodSectSmallMaxDatasize: 0xFF,
 ImageMihMethodrva: 0x01,
 ImageMihEhrva: 0x02,
 ImageMihBasicblock: 0x08,
 Vtable32bit: 0x01,
 Vtable64bit: 0x02,
 VtableFromUnmanaged: 0x04,
 VtableFromUnmanagedRetainAppdomain: 0x08,
 VtableCallMostDerived: 0x10,
 ImageEatjThunkSize: 32,
 MaxClassName: 1024,
 MaxPackageName: 1024
});

var RTL_UMS_THREAD_INFO_CLASS = new EnumT('RTL_UMS_THREAD_INFO_CLASS', {
 InvalidClass: 0,
 UserContext: 1,
 Priority: 2,
 Affinity: 3,
 Teb: 4,
 IsSuspended: 5,
 IsTerminated: 6,
 MaxClass: 7
});

var RTL_UMS_SCHEDULER_REASON = new EnumT('RTL_UMS_SCHEDULER_REASON', {
 Startup: 0,
 ThreadBlocked: 1,
 ThreadYield: 2
});

var HEAP_INFORMATION_CLASS = new EnumT('HEAP_INFORMATION_CLASS', {
 CompatibilityInformation: 0,
 EnableTerminationCorruption: 1
});

var ACTIVATION_CONTEXT_INFO_CLASS = new EnumT('ACTIVATION_CONTEXT_INFO_CLASS', {
 BasicInformation: 1,
 DetailedInformation: 2,
 AssemblyDetailedInformationContext: 3,
 FileInformationAssemblyOfAssemblyContext: 4,
 RunlevelInformationContext: 5,
 CompatibilityInformationContext: 6,
 ManifestResourceName: 7,
 MaxClass: 7,
 AssemblyDetailedInformationContxt: 3,
 FileInformationAssemblyOfAssemblyContxt: 4
});

var ACTCTX_REQUESTED_RUN_LEVEL = new EnumT('ACTCTX_REQUESTED_RUN_LEVEL', {
 Unspecified: 0,
 AsInvoker: 1,
 HighestAvailable: 2,
 RequireAdmin: 3,
 Numbers: 4
});

var ACTCTX_COMPATIBILITY_ELEMENT_TYPE = new EnumT('ACTCTX_COMPATIBILITY_ELEMENT_TYPE', {
 Unknown: 0,
 Os: 1,
 Mitigation: 2
});

var SERVICE_NODE_TYPE = new EnumT('SERVICE_NODE_TYPE', {
 DriverType: SERVICE_KERNEL_DRIVER,
 FileSystemType: SERVICE_FILE_SYSTEM_DRIVER,
 Win32OwnProcess: SERVICE_WIN32_OWN_PROCESS,
 Win32ShareProcess: SERVICE_WIN32_SHARE_PROCESS,
 AdapterType: SERVICE_ADAPTER,
 RecognizerType: SERVICE_RECOGNIZER_DRIVER
});

var SERVICE_LOAD_TYPE = new EnumT('SERVICE_LOAD_TYPE', {
 BootLoad: SERVICE_BOOT_START,
 SystemLoad: SERVICE_SYSTEM_START,
 AutoLoad: SERVICE_AUTO_START,
 DemandLoad: SERVICE_DEMAND_START,
 DisableLoad: SERVICE_DISABLED
});

var SERVICE_ERROR_TYPE = new EnumT('SERVICE_ERROR_TYPE', {
 IgnoreError: SERVICE_ERROR_IGNORE,
 NormalError: SERVICE_ERROR_NORMAL,
 SevereError: SERVICE_ERROR_SEVERE,
 CriticalError: SERVICE_ERROR_CRITICAL
});

var TAPE_DRIVE_PROBLEM_TYPE = new EnumT('TAPE_DRIVE_PROBLEM_TYPE', {
 None: 0,
 ReadWriteWarning: 1,
 ReadWriteError: 2,
 ReadWarning: 3,
 WriteWarning: 4,
 ReadError: 5,
 WriteError: 6,
 HardwareError: 7,
 UnsupportedMedia: 8,
 ScsiConnectionError: 9,
 TimetoClean: 10,
 CleanNow: 11,
 MediaLifeExpired: 12,
 SnappedTape: 13
});

var TRANSACTION_OUTCOME = new EnumT('TRANSACTION_OUTCOME', {
 Undetermined: 1,
 Committed: 1,
 Aborted: 2
});

var TRANSACTION_STATE = new EnumT('TRANSACTION_STATE', {
 Normal: 1,
 Indoubt: 1,
 CommittedNotify: 2
});

var TRANSACTION_INFORMATION_CLASS = new EnumT('TRANSACTION_INFORMATION_CLASS', {
 BasicInformation: 0,
 PropertiesInformation: 1,
 EnlistmentInformation: 2,
 SuperiorEnlistmentInformation: 3,
 BindInformation: 4,
 DtcPrivateInformation: 5
});

var TRANSACTIONMANAGER_INFORMATION_CLASS = new EnumT('TRANSACTIONMANAGER_INFORMATION_CLASS', {
 BasicInformation: 0,
 LogInformation: 1,
 LogPathInformation: 2,
 RecoveryInformation: 4,
 OnlineProbeInformation: 3,
 OldestInformation: 5
});

var RESOURCEMANAGER_INFORMATION_CLASS = new EnumT('RESOURCEMANAGER_INFORMATION_CLASS', {
 BasicInformation: 0,
 CompletionInformation: 1
});

var ENLISTMENT_INFORMATION_CLASS = new EnumT('ENLISTMENT_INFORMATION_CLASS', {
 BasicInformation: 0,
 RecoveryInformation: 1,
 CrmInformation: 2
});

var KTMOBJECT_TYPE = new EnumT('KTMOBJECT_TYPE', {
 Transaction: 0,
 TransactionManager: 1,
 ResourceManager: 2,
 Enlistment: 3,
 Invalid: 4
});

var TP_CALLBACK_PRIORITY = new EnumT('TP_CALLBACK_PRIORITY', {
 High: 0,
 Normal: 1,
 Low: 2,
 Invalid: 3
});


  PEXCEPTION_ROUTINE = new CallbackT('PEXCEPTION_ROUTINE', uint, [_EXCEPTION_RECORD.Δ, _void.Δ, _CONTEXT.Δ, _void.Δ]),
  PIMAGE_TLS_CALLBACK = new CallbackT('PIMAGE_TLS_CALLBACK', _void, [_void.Δ, ulong, _void.Δ]),
  PRTL_RUN_ONCE_INIT_FN = new CallbackT('PRTL_RUN_ONCE_INIT_FN', ulong, [_RTL_RUN_ONCE.Δ, _void.Δ, _void.Δ.Δ]),
  PRTL_UMS_SCHEDULER_ENTRY_POINT = new CallbackT('PRTL_UMS_SCHEDULER_ENTRY_POINT', _void, [RTL_UMS_SCHEDULER_REASON, ulong, _void.Δ]),
  PAPCFUNC = new CallbackT('PAPCFUNC', _void, [ulong]),
  PVECTORED_EXCEPTION_HANDLER = new CallbackT('PVECTORED_EXCEPTION_HANDLER', long, [_EXCEPTION_POINTERS.Δ]),
  WAITORTIMERCALLBACKFUNC = new CallbackT('WAITORTIMERCALLBACKFUNC', _void, [_void.Δ, uchar]),
  WORKERCALLBACKFUNC = new CallbackT('WORKERCALLBACKFUNC', _void, [_void.Δ]),
  APC_CALLBACK_FUNCTION = new CallbackT('APC_CALLBACK_FUNCTION', _void, [ulong, _void.Δ, _void.Δ]),
  PFLS_CALLBACK_FUNCTION = new CallbackT('PFLS_CALLBACK_FUNCTION', _void, [_void.Δ]),
  PSECURE_MEMORY_CACHE_CALLBACK = new CallbackT('PSECURE_MEMORY_CACHE_CALLBACK', uchar, [_void.Δ, ulong]),
  PTP_SIMPLE_CALLBACK = new CallbackT('PTP_SIMPLE_CALLBACK', _void, [_TP_CALLBACK_INSTANCE.Δ, _void.Δ]),
  PTP_CLEANUP_GROUP_CANCEL_CALLBACK = new CallbackT('PTP_CLEANUP_GROUP_CANCEL_CALLBACK', _void, [_void.Δ, _void.Δ]),
  PTP_WORK_CALLBACK = new CallbackT('PTP_WORK_CALLBACK', _void, [_TP_CALLBACK_INSTANCE.Δ, _void.Δ, _TP_WORK.Δ]),
  PTP_TIMER_CALLBACK = new CallbackT('PTP_TIMER_CALLBACK', _void, [_TP_CALLBACK_INSTANCE.Δ, _void.Δ, _TP_TIMER.Δ]),
  PTP_WAIT_CALLBACK = new CallbackT('PTP_WAIT_CALLBACK', _void, [_TP_CALLBACK_INSTANCE.Δ, _void.Δ, _TP_WAIT.Δ, ulong]),

var PROCESSOR_NUMBER = new StructT('PROCESSOR_NUMBER', {
 Group: WORD,
 Number: BYTE,
 Reserved: BYTE
});

var GROUP_AFFINITY = new StructT('GROUP_AFFINITY', {
 Mask: KAFFINITY,
 Group: WORD,
 Reserved: ARRAY(WORD, 3)
});

var FLOAT128 = new StructT('FLOAT128', {
 LowPart: longlong,
 HighPart: longlong
});

var undefined = new StructT('undefined', {
 LowPart: DWORD,
 HighPart: LONG
});

var undefined = new StructT('undefined', {
 LowPart: DWORD,
 HighPart: LONG
});

var undefined = new StructT('undefined', {
 LowPart: DWORD,
 HighPart: DWORD
});

var undefined = new StructT('undefined', {
 LowPart: DWORD,
 HighPart: DWORD
});

var LUID = new StructT('LUID', {
 LowPart: DWORD,
 HighPart: LONG
});

var LIST_ENTRY = new StructT('LIST_ENTRY', {
 Flink: _LIST_ENTRY.Δ,
 Blink: _LIST_ENTRY.Δ
});

var SLIST_ENTRY32 = new StructT('SLIST_ENTRY32', {
 Next: _SINGLE_LIST_ENTRY.Δ
});

var LIST_ENTRY32 = new StructT('LIST_ENTRY32', {
 Flink: DWORD,
 Blink: DWORD
});

var LIST_ENTRY64 = new StructT('LIST_ENTRY64', {
 Flink: ULONGLONG,
 Blink: ULONGLONG
});

var OBJECTID = new StructT('OBJECTID', {
 Lineage: GUID,
 Uniquifier: DWORD
});

var M128A = new StructT('M128A', {
 Low: ULONGLONG,
 High: LONGLONG
});

var XSAVE_FORMAT = new StructT('XSAVE_FORMAT', {
 ControlWord: WORD,
 StatusWord: WORD,
 TagWord: BYTE,
 Reserved1: BYTE,
 ErrorOpcode: WORD,
 ErrorOffset: DWORD,
 ErrorSelector: WORD,
 Reserved2: WORD,
 DataOffset: DWORD,
 DataSelector: WORD,
 Reserved3: WORD,
 MxCsr: DWORD,
 MxCsr_Mask: DWORD,
 FloatRegisters: ARRAY(M128A, 8),
 XmmRegisters: ARRAY(M128A, 8),
 Reserved4: ARRAY(BYTE, 192),
 StackControl: ARRAY(DWORD, 7),
 Cr0NpxState: DWORD
});

var XSAVE_AREA_HEADER = new StructT('XSAVE_AREA_HEADER', {
 Mask: DWORD64,
 Reserved: ARRAY(DWORD64, 7)
});

var XSAVE_AREA = new StructT('XSAVE_AREA', {
 LegacyState: XSAVE_FORMAT,
 Header: XSAVE_AREA_HEADER
});

var XSTATE_CONTEXT = new StructT('XSTATE_CONTEXT', {
 Mask: DWORD64,
 Length: DWORD,
 Reserved1: DWORD,
 Area: PXSAVE_AREA,
 Reserved2: DWORD,
 Buffer: PVOID,
 Reserved3: DWORD
});

var CONTEXT_CHUNK = new StructT('CONTEXT_CHUNK', {
 Offset: LONG,
 Length: DWORD
});

var CONTEXT_EX = new StructT('CONTEXT_EX', {
 All: CONTEXT_CHUNK,
 Legacy: CONTEXT_CHUNK,
 XState: CONTEXT_CHUNK
});

var FLOATING_SAVE_AREA = new StructT('FLOATING_SAVE_AREA', {
 ControlWord: DWORD,
 StatusWord: DWORD,
 TagWord: DWORD,
 ErrorOffset: DWORD,
 ErrorSelector: DWORD,
 DataOffset: DWORD,
 DataSelector: DWORD,
 RegisterArea: ARRAY(BYTE, SIZE_OF_80387_REGISTERS),
 Cr0NpxState: DWORD
});

var CONTEXT = new StructT('CONTEXT', {
 ContextFlags: DWORD,
 Dr0: DWORD,
 Dr1: DWORD,
 Dr2: DWORD,
 Dr3: DWORD,
 Dr6: DWORD,
 Dr7: DWORD,
 FloatSave: FLOATING_SAVE_AREA,
 SegGs: DWORD,
 SegFs: DWORD,
 SegEs: DWORD,
 SegDs: DWORD,
 Edi: DWORD,
 Esi: DWORD,
 Ebx: DWORD,
 Edx: DWORD,
 Ecx: DWORD,
 Eax: DWORD,
 Ebp: DWORD,
 Eip: DWORD,
 SegCs: DWORD,
 EFlags: DWORD,
 Esp: DWORD,
 SegSs: DWORD,
 ExtendedRegisters: ARRAY(BYTE, MAXIMUM_SUPPORTED_EXTENSION)
});

var LDT_ENTRY = new StructT('LDT_ENTRY', {
 LimitLow: WORD,
 BaseLow: WORD,
 HighWord: c:winnt.h@127863@S@_LDT_ENTRY@Ua
});

var undefined = new StructT('undefined', {
 BaseMid: BYTE,
 Flags1: BYTE,
 Flags2: BYTE,
 BaseHi: BYTE
});

var undefined = new StructT('undefined', {
 BaseMid: DWORD,
 Type: DWORD,
 Dpl: DWORD,
 Pres: DWORD,
 LimitHi: DWORD,
 Sys: DWORD,
 Reserved_0: DWORD,
 Default_Big: DWORD,
 Granularity: DWORD,
 BaseHi: DWORD
});

var WOW64_FLOATING_SAVE_AREA = new StructT('WOW64_FLOATING_SAVE_AREA', {
 ControlWord: DWORD,
 StatusWord: DWORD,
 TagWord: DWORD,
 ErrorOffset: DWORD,
 ErrorSelector: DWORD,
 DataOffset: DWORD,
 DataSelector: DWORD,
 RegisterArea: ARRAY(BYTE, WOW64_SIZE_OF_80387_REGISTERS),
 Cr0NpxState: DWORD
});

var WOW64_CONTEXT = new StructT('WOW64_CONTEXT', {
 ContextFlags: DWORD,
 Dr0: DWORD,
 Dr1: DWORD,
 Dr2: DWORD,
 Dr3: DWORD,
 Dr6: DWORD,
 Dr7: DWORD,
 FloatSave: WOW64_FLOATING_SAVE_AREA,
 SegGs: DWORD,
 SegFs: DWORD,
 SegEs: DWORD,
 SegDs: DWORD,
 Edi: DWORD,
 Esi: DWORD,
 Ebx: DWORD,
 Edx: DWORD,
 Ecx: DWORD,
 Eax: DWORD,
 Ebp: DWORD,
 Eip: DWORD,
 SegCs: DWORD,
 EFlags: DWORD,
 Esp: DWORD,
 SegSs: DWORD,
 ExtendedRegisters: ARRAY(BYTE, WOW64_MAXIMUM_SUPPORTED_EXTENSION)
});

var WOW64_LDT_ENTRY = new StructT('WOW64_LDT_ENTRY', {
 LimitLow: WORD,
 BaseLow: WORD,
 HighWord: c:winnt.h@178995@S@_WOW64_LDT_ENTRY@Ua
});

var undefined = new StructT('undefined', {
 BaseMid: BYTE,
 Flags1: BYTE,
 Flags2: BYTE,
 BaseHi: BYTE
});

var undefined = new StructT('undefined', {
 BaseMid: DWORD,
 Type: DWORD,
 Dpl: DWORD,
 Pres: DWORD,
 LimitHi: DWORD,
 Sys: DWORD,
 Reserved_0: DWORD,
 Default_Big: DWORD,
 Granularity: DWORD,
 BaseHi: DWORD
});

var WOW64_DESCRIPTOR_TABLE_ENTRY = new StructT('WOW64_DESCRIPTOR_TABLE_ENTRY', {
 Selector: DWORD,
 Descriptor: WOW64_LDT_ENTRY
});

var EXCEPTION_RECORD = new StructT('EXCEPTION_RECORD', {
 ExceptionCode: DWORD,
 ExceptionFlags: DWORD,
 ExceptionRecord: _EXCEPTION_RECORD.Δ,
 ExceptionAddress: PVOID,
 NumberParameters: DWORD,
 ExceptionInformation: ARRAY(ULONG_PTR, EXCEPTION_MAXIMUM_PARAMETERS)
});

var EXCEPTION_RECORD32 = new StructT('EXCEPTION_RECORD32', {
 ExceptionCode: DWORD,
 ExceptionFlags: DWORD,
 ExceptionRecord: DWORD,
 ExceptionAddress: DWORD,
 NumberParameters: DWORD,
 ExceptionInformation: ARRAY(DWORD, EXCEPTION_MAXIMUM_PARAMETERS)
});

var EXCEPTION_RECORD64 = new StructT('EXCEPTION_RECORD64', {
 ExceptionCode: DWORD,
 ExceptionFlags: DWORD,
 ExceptionRecord: DWORD64,
 ExceptionAddress: DWORD64,
 NumberParameters: DWORD,
 __unusedAlignment: DWORD,
 ExceptionInformation: ARRAY(DWORD64, EXCEPTION_MAXIMUM_PARAMETERS)
});

var EXCEPTION_POINTERS = new StructT('EXCEPTION_POINTERS', {
 ExceptionRecord: PEXCEPTION_RECORD,
 ContextRecord: PCONTEXT
});

var GENERIC_MAPPING = new StructT('GENERIC_MAPPING', {
 GenericRead: ACCESS_MASK,
 GenericWrite: ACCESS_MASK,
 GenericExecute: ACCESS_MASK,
 GenericAll: ACCESS_MASK
});

var LUID_AND_ATTRIBUTES = new StructT('LUID_AND_ATTRIBUTES', {
 Luid: LUID,
 Attributes: DWORD
});

var SID_IDENTIFIER_AUTHORITY = new StructT('SID_IDENTIFIER_AUTHORITY', {
 Value: ARRAY(BYTE, 6)
});

var SID = new StructT('SID', {
 Revision: BYTE,
 SubAuthorityCount: BYTE,
 IdentifierAuthority: SID_IDENTIFIER_AUTHORITY,
 SubAuthority: ARRAY(DWORD, ANYSIZE_ARRAY)
});

var SID_AND_ATTRIBUTES = new StructT('SID_AND_ATTRIBUTES', {
 Sid: PSID,
 Attributes: DWORD
});

var SID_AND_ATTRIBUTES_HASH = new StructT('SID_AND_ATTRIBUTES_HASH', {
 SidCount: DWORD,
 SidAttr: PSID_AND_ATTRIBUTES,
 Hash: ARRAY(SID_HASH_ENTRY, SID_HASH_SIZE)
});

var ACL = new StructT('ACL', {
 AclRevision: BYTE,
 Sbz1: BYTE,
 AclSize: WORD,
 AceCount: WORD,
 Sbz2: WORD
});

var ACE_HEADER = new StructT('ACE_HEADER', {
 AceType: BYTE,
 AceFlags: BYTE,
 AceSize: WORD
});

var ACCESS_ALLOWED_ACE = new StructT('ACCESS_ALLOWED_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 SidStart: DWORD
});

var ACCESS_DENIED_ACE = new StructT('ACCESS_DENIED_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 SidStart: DWORD
});

var SYSTEM_AUDIT_ACE = new StructT('SYSTEM_AUDIT_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 SidStart: DWORD
});

var SYSTEM_ALARM_ACE = new StructT('SYSTEM_ALARM_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 SidStart: DWORD
});

var SYSTEM_MANDATORY_LABEL_ACE = new StructT('SYSTEM_MANDATORY_LABEL_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 SidStart: DWORD
});

var ACCESS_ALLOWED_OBJECT_ACE = new StructT('ACCESS_ALLOWED_OBJECT_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 Flags: DWORD,
 ObjectType: GUID,
 InheritedObjectType: GUID,
 SidStart: DWORD
});

var ACCESS_DENIED_OBJECT_ACE = new StructT('ACCESS_DENIED_OBJECT_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 Flags: DWORD,
 ObjectType: GUID,
 InheritedObjectType: GUID,
 SidStart: DWORD
});

var SYSTEM_AUDIT_OBJECT_ACE = new StructT('SYSTEM_AUDIT_OBJECT_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 Flags: DWORD,
 ObjectType: GUID,
 InheritedObjectType: GUID,
 SidStart: DWORD
});

var SYSTEM_ALARM_OBJECT_ACE = new StructT('SYSTEM_ALARM_OBJECT_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 Flags: DWORD,
 ObjectType: GUID,
 InheritedObjectType: GUID,
 SidStart: DWORD
});

var ACCESS_ALLOWED_CALLBACK_ACE = new StructT('ACCESS_ALLOWED_CALLBACK_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 SidStart: DWORD
});

var ACCESS_DENIED_CALLBACK_ACE = new StructT('ACCESS_DENIED_CALLBACK_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 SidStart: DWORD
});

var SYSTEM_AUDIT_CALLBACK_ACE = new StructT('SYSTEM_AUDIT_CALLBACK_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 SidStart: DWORD
});

var SYSTEM_ALARM_CALLBACK_ACE = new StructT('SYSTEM_ALARM_CALLBACK_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 SidStart: DWORD
});

var ACCESS_ALLOWED_CALLBACK_OBJECT_ACE = new StructT('ACCESS_ALLOWED_CALLBACK_OBJECT_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 Flags: DWORD,
 ObjectType: GUID,
 InheritedObjectType: GUID,
 SidStart: DWORD
});

var ACCESS_DENIED_CALLBACK_OBJECT_ACE = new StructT('ACCESS_DENIED_CALLBACK_OBJECT_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 Flags: DWORD,
 ObjectType: GUID,
 InheritedObjectType: GUID,
 SidStart: DWORD
});

var SYSTEM_AUDIT_CALLBACK_OBJECT_ACE = new StructT('SYSTEM_AUDIT_CALLBACK_OBJECT_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 Flags: DWORD,
 ObjectType: GUID,
 InheritedObjectType: GUID,
 SidStart: DWORD
});

var SYSTEM_ALARM_CALLBACK_OBJECT_ACE = new StructT('SYSTEM_ALARM_CALLBACK_OBJECT_ACE', {
 Header: ACE_HEADER,
 Mask: ACCESS_MASK,
 Flags: DWORD,
 ObjectType: GUID,
 InheritedObjectType: GUID,
 SidStart: DWORD
});

var ACL_REVISION_INFORMATION = new StructT('ACL_REVISION_INFORMATION', {
 AclRevision: DWORD
});

var ACL_SIZE_INFORMATION = new StructT('ACL_SIZE_INFORMATION', {
 AceCount: DWORD,
 AclBytesInUse: DWORD,
 AclBytesFree: DWORD
});

var SECURITY_DESCRIPTOR_RELATIVE = new StructT('SECURITY_DESCRIPTOR_RELATIVE', {
 Revision: BYTE,
 Sbz1: BYTE,
 Control: SECURITY_DESCRIPTOR_CONTROL,
 Owner: DWORD,
 Group: DWORD,
 Sacl: DWORD,
 Dacl: DWORD
});

var SECURITY_DESCRIPTOR = new StructT('SECURITY_DESCRIPTOR', {
 Revision: BYTE,
 Sbz1: BYTE,
 Control: SECURITY_DESCRIPTOR_CONTROL,
 Owner: PSID,
 Group: PSID,
 Sacl: PACL,
 Dacl: PACL
});

var OBJECT_TYPE_LIST = new StructT('OBJECT_TYPE_LIST', {
 Level: WORD,
 Sbz: WORD,
 ObjectType: GUID.Δ
});

var PRIVILEGE_SET = new StructT('PRIVILEGE_SET', {
 PrivilegeCount: DWORD,
 Control: DWORD,
 Privilege: ARRAY(LUID_AND_ATTRIBUTES, ANYSIZE_ARRAY)
});

var ACCESS_REASONS = new StructT('ACCESS_REASONS', {
 Data: ARRAY(ACCESS_REASON, 32)
});

var SE_SECURITY_DESCRIPTOR = new StructT('SE_SECURITY_DESCRIPTOR', {
 Size: DWORD,
 Flags: DWORD,
 SecurityDescriptor: PSECURITY_DESCRIPTOR
});

var SE_ACCESS_REQUEST = new StructT('SE_ACCESS_REQUEST', {
 Size: DWORD,
 SeSecurityDescriptor: PSE_SECURITY_DESCRIPTOR,
 DesiredAccess: ACCESS_MASK,
 PreviouslyGrantedAccess: ACCESS_MASK,
 PrincipalSelfSid: PSID,
 GenericMapping: PGENERIC_MAPPING,
 ObjectTypeListCount: DWORD,
 ObjectTypeList: POBJECT_TYPE_LIST
});

var SE_ACCESS_REPLY = new StructT('SE_ACCESS_REPLY', {
 Size: DWORD,
 ResultListCount: DWORD,
 GrantedAccess: PACCESS_MASK,
 AccessStatus: PDWORD,
 AccessReason: PACCESS_REASONS,
 Privileges: PPRIVILEGE_SET.Δ
});

var TOKEN_USER = new StructT('TOKEN_USER', {
 User: SID_AND_ATTRIBUTES
});

var TOKEN_GROUPS = new StructT('TOKEN_GROUPS', {
 GroupCount: DWORD,
 Groups: ARRAY(SID_AND_ATTRIBUTES, ANYSIZE_ARRAY)
});

var TOKEN_PRIVILEGES = new StructT('TOKEN_PRIVILEGES', {
 PrivilegeCount: DWORD,
 Privileges: ARRAY(LUID_AND_ATTRIBUTES, ANYSIZE_ARRAY)
});

var TOKEN_OWNER = new StructT('TOKEN_OWNER', {
 Owner: PSID
});

var TOKEN_PRIMARY_GROUP = new StructT('TOKEN_PRIMARY_GROUP', {
 PrimaryGroup: PSID
});

var TOKEN_DEFAULT_DACL = new StructT('TOKEN_DEFAULT_DACL', {
 DefaultDacl: PACL
});

var TOKEN_GROUPS_AND_PRIVILEGES = new StructT('TOKEN_GROUPS_AND_PRIVILEGES', {
 SidCount: DWORD,
 SidLength: DWORD,
 Sids: PSID_AND_ATTRIBUTES,
 RestrictedSidCount: DWORD,
 RestrictedSidLength: DWORD,
 RestrictedSids: PSID_AND_ATTRIBUTES,
 PrivilegeCount: DWORD,
 PrivilegeLength: DWORD,
 Privileges: PLUID_AND_ATTRIBUTES,
 AuthenticationId: LUID
});

var TOKEN_LINKED_TOKEN = new StructT('TOKEN_LINKED_TOKEN', {
 LinkedToken: HANDLE
});

var TOKEN_ELEVATION = new StructT('TOKEN_ELEVATION', {
 TokenIsElevated: DWORD
});

var TOKEN_MANDATORY_LABEL = new StructT('TOKEN_MANDATORY_LABEL', {
 Label: SID_AND_ATTRIBUTES
});

var TOKEN_MANDATORY_POLICY = new StructT('TOKEN_MANDATORY_POLICY', {
 Policy: DWORD
});

var TOKEN_ACCESS_INFORMATION = new StructT('TOKEN_ACCESS_INFORMATION', {
 SidHash: PSID_AND_ATTRIBUTES_HASH,
 RestrictedSidHash: PSID_AND_ATTRIBUTES_HASH,
 Privileges: PTOKEN_PRIVILEGES,
 AuthenticationId: LUID,
 TokenType: TOKEN_TYPE,
 ImpersonationLevel: SECURITY_IMPERSONATION_LEVEL,
 MandatoryPolicy: TOKEN_MANDATORY_POLICY,
 Flags: DWORD
});

var TOKEN_AUDIT_POLICY = new StructT('TOKEN_AUDIT_POLICY', {
 PerUserPolicy: ARRAY(BYTE, undefined)
});

var TOKEN_SOURCE = new StructT('TOKEN_SOURCE', {
 SourceName: ARRAY(CHAR, TOKEN_SOURCE_LENGTH),
 SourceIdentifier: LUID
});

var TOKEN_STATISTICS = new StructT('TOKEN_STATISTICS', {
 TokenId: LUID,
 AuthenticationId: LUID,
 ExpirationTime: LARGE_INTEGER,
 TokenType: TOKEN_TYPE,
 ImpersonationLevel: SECURITY_IMPERSONATION_LEVEL,
 DynamicCharged: DWORD,
 DynamicAvailable: DWORD,
 GroupCount: DWORD,
 PrivilegeCount: DWORD,
 ModifiedId: LUID
});

var TOKEN_CONTROL = new StructT('TOKEN_CONTROL', {
 TokenId: LUID,
 AuthenticationId: LUID,
 ModifiedId: LUID,
 TokenSource: TOKEN_SOURCE
});

var TOKEN_ORIGIN = new StructT('TOKEN_ORIGIN', {
 OriginatingLogonSession: LUID
});

var SECURITY_QUALITY_OF_SERVICE = new StructT('SECURITY_QUALITY_OF_SERVICE', {
 Length: DWORD,
 ImpersonationLevel: SECURITY_IMPERSONATION_LEVEL,
 ContextTrackingMode: SECURITY_CONTEXT_TRACKING_MODE,
 EffectiveOnly: BOOLEAN
});

var SE_IMPERSONATION_STATE = new StructT('SE_IMPERSONATION_STATE', {
 Token: PACCESS_TOKEN,
 CopyOnOpen: BOOLEAN,
 EffectiveOnly: BOOLEAN,
 Level: SECURITY_IMPERSONATION_LEVEL
});

var JOB_SET_ARRAY = new StructT('JOB_SET_ARRAY', {
 JobHandle: HANDLE,
 MemberLevel: DWORD,
 Flags: DWORD
});

var NT_TIB = new StructT('NT_TIB', {
 ExceptionList: _EXCEPTION_REGISTRATION_RECORD.Δ,
 StackBase: PVOID,
 StackLimit: PVOID,
 SubSystemTib: PVOID,
 ArbitraryUserPointer: PVOID,
 Self: _NT_TIB.Δ
});


var NT_TIB32 = new StructT('NT_TIB32', {
 ExceptionList: DWORD,
 StackBase: DWORD,
 StackLimit: DWORD,
 SubSystemTib: DWORD,
 ArbitraryUserPointer: DWORD,
 Self: DWORD
});

var NT_TIB64 = new StructT('NT_TIB64', {
 ExceptionList: DWORD64,
 StackBase: DWORD64,
 StackLimit: DWORD64,
 SubSystemTib: DWORD64,
 ArbitraryUserPointer: DWORD64,
 Self: DWORD64
});

var UMS_CREATE_THREAD_ATTRIBUTES = new StructT('UMS_CREATE_THREAD_ATTRIBUTES', {
 UmsVersion: DWORD,
 UmsContext: PVOID,
 UmsCompletionList: PVOID
});

var QUOTA_LIMITS = new StructT('QUOTA_LIMITS', {
 PagedPoolLimit: SIZE_T,
 NonPagedPoolLimit: SIZE_T,
 MinimumWorkingSetSize: SIZE_T,
 MaximumWorkingSetSize: SIZE_T,
 PagefileLimit: SIZE_T,
 TimeLimit: LARGE_INTEGER
});

var undefined = new StructT('undefined', {
 RatePercent: DWORD,
 Reserved0: DWORD
});

var QUOTA_LIMITS_EX = new StructT('QUOTA_LIMITS_EX', {
 PagedPoolLimit: SIZE_T,
 NonPagedPoolLimit: SIZE_T,
 MinimumWorkingSetSize: SIZE_T,
 MaximumWorkingSetSize: SIZE_T,
 PagefileLimit: SIZE_T,
 TimeLimit: LARGE_INTEGER,
 WorkingSetLimit: SIZE_T,
 Reserved2: SIZE_T,
 Reserved3: SIZE_T,
 Reserved4: SIZE_T,
 Flags: DWORD,
 CpuRateLimit: RATE_QUOTA_LIMIT
});

var IO_COUNTERS = new StructT('IO_COUNTERS', {
 ReadOperationCount: ULONGLONG,
 WriteOperationCount: ULONGLONG,
 OtherOperationCount: ULONGLONG,
 ReadTransferCount: ULONGLONG,
 WriteTransferCount: ULONGLONG,
 OtherTransferCount: ULONGLONG
});

var JOBOBJECT_BASIC_ACCOUNTING_INFORMATION = new StructT('JOBOBJECT_BASIC_ACCOUNTING_INFORMATION', {
 TotalUserTime: LARGE_INTEGER,
 TotalKernelTime: LARGE_INTEGER,
 ThisPeriodTotalUserTime: LARGE_INTEGER,
 ThisPeriodTotalKernelTime: LARGE_INTEGER,
 TotalPageFaultCount: DWORD,
 TotalProcesses: DWORD,
 ActiveProcesses: DWORD,
 TotalTerminatedProcesses: DWORD
});

var JOBOBJECT_BASIC_LIMIT_INFORMATION = new StructT('JOBOBJECT_BASIC_LIMIT_INFORMATION', {
 PerProcessUserTimeLimit: LARGE_INTEGER,
 PerJobUserTimeLimit: LARGE_INTEGER,
 LimitFlags: DWORD,
 MinimumWorkingSetSize: SIZE_T,
 MaximumWorkingSetSize: SIZE_T,
 ActiveProcessLimit: DWORD,
 Affinity: ULONG_PTR,
 PriorityClass: DWORD,
 SchedulingClass: DWORD
});

var JOBOBJECT_EXTENDED_LIMIT_INFORMATION = new StructT('JOBOBJECT_EXTENDED_LIMIT_INFORMATION', {
 BasicLimitInformation: JOBOBJECT_BASIC_LIMIT_INFORMATION,
 IoInfo: IO_COUNTERS,
 ProcessMemoryLimit: SIZE_T,
 JobMemoryLimit: SIZE_T,
 PeakProcessMemoryUsed: SIZE_T,
 PeakJobMemoryUsed: SIZE_T
});

var JOBOBJECT_BASIC_PROCESS_ID_LIST = new StructT('JOBOBJECT_BASIC_PROCESS_ID_LIST', {
 NumberOfAssignedProcesses: DWORD,
 NumberOfProcessIdsInList: DWORD,
 ProcessIdList: ARRAY(ULONG_PTR, 1)
});

var JOBOBJECT_BASIC_UI_RESTRICTIONS = new StructT('JOBOBJECT_BASIC_UI_RESTRICTIONS', {
 UIRestrictionsClass: DWORD
});

var JOBOBJECT_SECURITY_LIMIT_INFORMATION = new StructT('JOBOBJECT_SECURITY_LIMIT_INFORMATION', {
 SecurityLimitFlags: DWORD,
 JobToken: HANDLE,
 SidsToDisable: PTOKEN_GROUPS,
 PrivilegesToDelete: PTOKEN_PRIVILEGES,
 RestrictedSids: PTOKEN_GROUPS
});

var JOBOBJECT_END_OF_JOB_TIME_INFORMATION = new StructT('JOBOBJECT_END_OF_JOB_TIME_INFORMATION', {
 EndOfJobTimeAction: DWORD
});

var JOBOBJECT_ASSOCIATE_COMPLETION_PORT = new StructT('JOBOBJECT_ASSOCIATE_COMPLETION_PORT', {
 CompletionKey: PVOID,
 CompletionPort: HANDLE
});

var JOBOBJECT_BASIC_AND_IO_ACCOUNTING_INFORMATION = new StructT('JOBOBJECT_BASIC_AND_IO_ACCOUNTING_INFORMATION', {
 BasicInfo: JOBOBJECT_BASIC_ACCOUNTING_INFORMATION,
 IoInfo: IO_COUNTERS
});

var JOBOBJECT_JOBSET_INFORMATION = new StructT('JOBOBJECT_JOBSET_INFORMATION', {
 MemberLevel: DWORD
});

var CACHE_DESCRIPTOR = new StructT('CACHE_DESCRIPTOR', {
 Level: BYTE,
 Associativity: BYTE,
 LineSize: WORD,
 Size: DWORD,
 Type: PROCESSOR_CACHE_TYPE
});

var SYSTEM_LOGICAL_PROCESSOR_INFORMATION = new StructT('SYSTEM_LOGICAL_PROCESSOR_INFORMATION', {
 ProcessorMask: ULONG_PTR,
 Relationship: LOGICAL_PROCESSOR_RELATIONSHIP
});

var undefined = new StructT('undefined', {
 Flags: BYTE
});

var undefined = new StructT('undefined', {
 NodeNumber: DWORD
});

var PROCESSOR_RELATIONSHIP = new StructT('PROCESSOR_RELATIONSHIP', {
 Flags: BYTE,
 Reserved: ARRAY(BYTE, 21),
 GroupCount: WORD,
 GroupMask: ARRAY(GROUP_AFFINITY, ANYSIZE_ARRAY)
});

var NUMA_NODE_RELATIONSHIP = new StructT('NUMA_NODE_RELATIONSHIP', {
 NodeNumber: DWORD,
 Reserved: ARRAY(BYTE, 20),
 GroupMask: GROUP_AFFINITY
});

var CACHE_RELATIONSHIP = new StructT('CACHE_RELATIONSHIP', {
 Level: BYTE,
 Associativity: BYTE,
 LineSize: WORD,
 CacheSize: DWORD,
 Type: PROCESSOR_CACHE_TYPE,
 Reserved: ARRAY(BYTE, 20),
 GroupMask: GROUP_AFFINITY
});

var PROCESSOR_GROUP_INFO = new StructT('PROCESSOR_GROUP_INFO', {
 MaximumProcessorCount: BYTE,
 ActiveProcessorCount: BYTE,
 Reserved: ARRAY(BYTE, 38),
 ActiveProcessorMask: KAFFINITY
});

var GROUP_RELATIONSHIP = new StructT('GROUP_RELATIONSHIP', {
 MaximumGroupCount: WORD,
 ActiveGroupCount: WORD,
 Reserved: ARRAY(BYTE, 20),
 GroupInfo: ARRAY(PROCESSOR_GROUP_INFO, ANYSIZE_ARRAY)
});

var SYSTEM_LOGICAL_PROCESSOR_INFORMATION_EX = new StructT('SYSTEM_LOGICAL_PROCESSOR_INFORMATION_EX', {
 Relationship: LOGICAL_PROCESSOR_RELATIONSHIP,
 Size: DWORD
});

var SYSTEM_PROCESSOR_CYCLE_TIME_INFORMATION = new StructT('SYSTEM_PROCESSOR_CYCLE_TIME_INFORMATION', {
 CycleTime: DWORD64
});

var XSTATE_FEATURE = new StructT('XSTATE_FEATURE', {
 Offset: DWORD,
 Size: DWORD
});

var XSTATE_CONFIGURATION = new StructT('XSTATE_CONFIGURATION', {
 EnabledFeatures: DWORD64,
 Size: DWORD,
 OptimizedSave: DWORD,
 Features: ARRAY(XSTATE_FEATURE, MAXIMUM_XSTATE_FEATURES)
});

var MEMORY_BASIC_INFORMATION = new StructT('MEMORY_BASIC_INFORMATION', {
 BaseAddress: PVOID,
 AllocationBase: PVOID,
 AllocationProtect: DWORD,
 RegionSize: SIZE_T,
 State: DWORD,
 Protect: DWORD,
 Type: DWORD
});

var MEMORY_BASIC_INFORMATION32 = new StructT('MEMORY_BASIC_INFORMATION32', {
 BaseAddress: DWORD,
 AllocationBase: DWORD,
 AllocationProtect: DWORD,
 RegionSize: DWORD,
 State: DWORD,
 Protect: DWORD,
 Type: DWORD
});

var MEMORY_BASIC_INFORMATION64 = new StructT('MEMORY_BASIC_INFORMATION64', {
 BaseAddress: ULONGLONG,
 AllocationBase: ULONGLONG,
 AllocationProtect: DWORD,
 __alignment1: DWORD,
 RegionSize: ULONGLONG,
 State: DWORD,
 Protect: DWORD,
 Type: DWORD,
 __alignment2: DWORD
});

var FILE_NOTIFY_INFORMATION = new StructT('FILE_NOTIFY_INFORMATION', {
 NextEntryOffset: DWORD,
 Action: DWORD,
 FileNameLength: DWORD,
 FileName: ARRAY(WCHAR, 1)
});

var REPARSE_GUID_DATA_BUFFER = new StructT('REPARSE_GUID_DATA_BUFFER', {
 ReparseTag: DWORD,
 ReparseDataLength: WORD,
 Reserved: WORD,
 ReparseGuid: GUID,
 GenericReparseBuffer:
});

var undefined = new StructT('undefined', {
 DataBuffer: ARRAY(BYTE, 1)
});

var CM_POWER_DATA = new StructT('CM_POWER_DATA', {
 PD_Size: DWORD,
 PD_MostRecentPowerState: DEVICE_POWER_STATE,
 PD_Capabilities: DWORD,
 PD_D1Latency: DWORD,
 PD_D2Latency: DWORD,
 PD_D3Latency: DWORD,
 PD_PowerStateMapping: ARRAY(DEVICE_POWER_STATE, POWER_SYSTEM_MAXIMUM),
 PD_DeepestSystemWake: SYSTEM_POWER_STATE
});

var SET_POWER_SETTING_VALUE = new StructT('SET_POWER_SETTING_VALUE', {
 Version: DWORD,
 Guid: GUID,
 PowerCondition: SYSTEM_POWER_CONDITION,
 DataLength: DWORD,
 Data: ARRAY(BYTE, ANYSIZE_ARRAY)
});

var NOTIFY_USER_POWER_SETTING = new StructT('NOTIFY_USER_POWER_SETTING', {
 Guid: GUID
});

var APPLICATIONLAUNCH_SETTING_VALUE = new StructT('APPLICATIONLAUNCH_SETTING_VALUE', {
 ActivationTime: LARGE_INTEGER,
 Flags: DWORD,
 ButtonInstanceID: DWORD
});

var BATTERY_REPORTING_SCALE = new StructT('BATTERY_REPORTING_SCALE', {
 Granularity: DWORD,
 Capacity: DWORD
});

var PPM_WMI_LEGACY_PERFSTATE = new StructT('PPM_WMI_LEGACY_PERFSTATE', {
 Frequency: DWORD,
 Flags: DWORD,
 PercentFrequency: DWORD
});

var PPM_WMI_IDLE_STATE = new StructT('PPM_WMI_IDLE_STATE', {
 Latency: DWORD,
 Power: DWORD,
 TimeCheck: DWORD,
 PromotePercent: BYTE,
 DemotePercent: BYTE,
 StateType: BYTE,
 Reserved: BYTE,
 StateFlags: DWORD,
 Context: DWORD,
 IdleHandler: DWORD,
 Reserved1: DWORD
});

var PPM_WMI_IDLE_STATES = new StructT('PPM_WMI_IDLE_STATES', {
 Type: DWORD,
 Count: DWORD,
 TargetState: DWORD,
 OldState: DWORD,
 TargetProcessors: DWORD64,
 State: ARRAY(PPM_WMI_IDLE_STATE, ANYSIZE_ARRAY)
});

var PPM_WMI_IDLE_STATES_EX = new StructT('PPM_WMI_IDLE_STATES_EX', {
 Type: DWORD,
 Count: DWORD,
 TargetState: DWORD,
 OldState: DWORD,
 TargetProcessors: PVOID,
 State: ARRAY(PPM_WMI_IDLE_STATE, ANYSIZE_ARRAY)
});

var PPM_WMI_PERF_STATE = new StructT('PPM_WMI_PERF_STATE', {
 Frequency: DWORD,
 Power: DWORD,
 PercentFrequency: BYTE,
 IncreaseLevel: BYTE,
 DecreaseLevel: BYTE,
 Type: BYTE,
 IncreaseTime: DWORD,
 DecreaseTime: DWORD,
 Control: DWORD64,
 Status: DWORD64,
 HitCount: DWORD,
 Reserved1: DWORD,
 Reserved2: DWORD64,
 Reserved3: DWORD64
});

var PPM_WMI_PERF_STATES = new StructT('PPM_WMI_PERF_STATES', {
 Count: DWORD,
 MaxFrequency: DWORD,
 CurrentState: DWORD,
 MaxPerfState: DWORD,
 MinPerfState: DWORD,
 LowestPerfState: DWORD,
 ThermalConstraint: DWORD,
 BusyAdjThreshold: BYTE,
 PolicyType: BYTE,
 Type: BYTE,
 Reserved: BYTE,
 TimerInterval: DWORD,
 TargetProcessors: DWORD64,
 PStateHandler: DWORD,
 PStateContext: DWORD,
 TStateHandler: DWORD,
 TStateContext: DWORD,
 FeedbackHandler: DWORD,
 Reserved1: DWORD,
 Reserved2: DWORD64,
 State: ARRAY(PPM_WMI_PERF_STATE, ANYSIZE_ARRAY)
});

var PPM_WMI_PERF_STATES_EX = new StructT('PPM_WMI_PERF_STATES_EX', {
 Count: DWORD,
 MaxFrequency: DWORD,
 CurrentState: DWORD,
 MaxPerfState: DWORD,
 MinPerfState: DWORD,
 LowestPerfState: DWORD,
 ThermalConstraint: DWORD,
 BusyAdjThreshold: BYTE,
 PolicyType: BYTE,
 Type: BYTE,
 Reserved: BYTE,
 TimerInterval: DWORD,
 TargetProcessors: PVOID,
 PStateHandler: DWORD,
 PStateContext: DWORD,
 TStateHandler: DWORD,
 TStateContext: DWORD,
 FeedbackHandler: DWORD,
 Reserved1: DWORD,
 Reserved2: DWORD64,
 State: ARRAY(PPM_WMI_PERF_STATE, ANYSIZE_ARRAY)
});

var PPM_IDLE_STATE_ACCOUNTING = new StructT('PPM_IDLE_STATE_ACCOUNTING', {
 IdleTransitions: DWORD,
 FailedTransitions: DWORD,
 InvalidBucketIndex: DWORD,
 TotalTime: DWORD64,
 IdleTimeBuckets: ARRAY(DWORD, PROC_IDLE_BUCKET_COUNT)
});

var PPM_IDLE_ACCOUNTING = new StructT('PPM_IDLE_ACCOUNTING', {
 StateCount: DWORD,
 TotalTransitions: DWORD,
 ResetCount: DWORD,
 StartTime: DWORD64,
 State: ARRAY(PPM_IDLE_STATE_ACCOUNTING, ANYSIZE_ARRAY)
});

var PPM_IDLE_STATE_BUCKET_EX = new StructT('PPM_IDLE_STATE_BUCKET_EX', {
 TotalTimeUs: DWORD64,
 MinTimeUs: DWORD,
 MaxTimeUs: DWORD,
 Count: DWORD
});

var PPM_IDLE_STATE_ACCOUNTING_EX = new StructT('PPM_IDLE_STATE_ACCOUNTING_EX', {
 TotalTime: DWORD64,
 IdleTransitions: DWORD,
 FailedTransitions: DWORD,
 InvalidBucketIndex: DWORD,
 MinTimeUs: DWORD,
 MaxTimeUs: DWORD,
 IdleTimeBuckets: ARRAY(PPM_IDLE_STATE_BUCKET_EX, PROC_IDLE_BUCKET_COUNT_EX)
});

var PPM_IDLE_ACCOUNTING_EX = new StructT('PPM_IDLE_ACCOUNTING_EX', {
 StateCount: DWORD,
 TotalTransitions: DWORD,
 ResetCount: DWORD,
 StartTime: DWORD64,
 State: ARRAY(PPM_IDLE_STATE_ACCOUNTING_EX, ANYSIZE_ARRAY)
});

var PPM_PERFSTATE_EVENT = new StructT('PPM_PERFSTATE_EVENT', {
 State: DWORD,
 Status: DWORD,
 Latency: DWORD,
 Speed: DWORD,
 Processor: DWORD
});

var PPM_PERFSTATE_DOMAIN_EVENT = new StructT('PPM_PERFSTATE_DOMAIN_EVENT', {
 State: DWORD,
 Latency: DWORD,
 Speed: DWORD,
 Processors: DWORD64
});

var PPM_IDLESTATE_EVENT = new StructT('PPM_IDLESTATE_EVENT', {
 NewState: DWORD,
 OldState: DWORD,
 Processors: DWORD64
});

var PPM_THERMALCHANGE_EVENT = new StructT('PPM_THERMALCHANGE_EVENT', {
 ThermalConstraint: DWORD,
 Processors: DWORD64
});

var PPM_THERMAL_POLICY_EVENT = new StructT('PPM_THERMAL_POLICY_EVENT', {
 Mode: BYTE,
 Processors: DWORD64
});

var POWER_ACTION_POLICY = new StructT('POWER_ACTION_POLICY', {
 Action: POWER_ACTION,
 Flags: DWORD,
 EventCode: DWORD
});

var SYSTEM_POWER_LEVEL = new StructT('SYSTEM_POWER_LEVEL', {
 Enable: BOOLEAN,
 Spare: ARRAY(BYTE, 3),
 BatteryLevel: DWORD,
 PowerPolicy: POWER_ACTION_POLICY,
 MinSystemState: SYSTEM_POWER_STATE
});

var SYSTEM_POWER_POLICY = new StructT('SYSTEM_POWER_POLICY', {
 Revision: DWORD,
 PowerButton: POWER_ACTION_POLICY,
 SleepButton: POWER_ACTION_POLICY,
 LidClose: POWER_ACTION_POLICY,
 LidOpenWake: SYSTEM_POWER_STATE,
 Reserved: DWORD,
 Idle: POWER_ACTION_POLICY,
 IdleTimeout: DWORD,
 IdleSensitivity: BYTE,
 DynamicThrottle: BYTE,
 Spare2: ARRAY(BYTE, 2),
 MinSleep: SYSTEM_POWER_STATE,
 MaxSleep: SYSTEM_POWER_STATE,
 ReducedLatencySleep: SYSTEM_POWER_STATE,
 WinLogonFlags: DWORD,
 Spare3: DWORD,
 DozeS4Timeout: DWORD,
 BroadcastCapacityResolution: DWORD,
 DischargePolicy: ARRAY(SYSTEM_POWER_LEVEL, NUM_DISCHARGE_POLICIES),
 VideoTimeout: DWORD,
 VideoDimDisplay: BOOLEAN,
 VideoReserved: ARRAY(DWORD, 3),
 SpindownTimeout: DWORD,
 OptimizeForPower: BOOLEAN,
 FanThrottleTolerance: BYTE,
 ForcedThrottle: BYTE,
 MinThrottle: BYTE,
 OverThrottled: POWER_ACTION_POLICY
});

var PROCESSOR_IDLESTATE_INFO = new StructT('PROCESSOR_IDLESTATE_INFO', {
 TimeCheck: DWORD,
 DemotePercent: BYTE,
 PromotePercent: BYTE,
 Spare: ARRAY(BYTE, 2)
});

var PROCESSOR_IDLESTATE_POLICY = new StructT('PROCESSOR_IDLESTATE_POLICY', {
 Revision: WORD,
 Flags: c:winnt.h@338317@SA@PROCESSOR_IDLESTATE_POLICY@Ua,
 PolicyCount: DWORD,
 Policy: ARRAY(PROCESSOR_IDLESTATE_INFO, PROCESSOR_IDLESTATE_POLICY_COUNT)
});

var undefined = new StructT('undefined', {
 AllowScaling: WORD,
 Disabled: WORD,
 Reserved: WORD
});

var PROCESSOR_POWER_POLICY_INFO = new StructT('PROCESSOR_POWER_POLICY_INFO', {
 TimeCheck: DWORD,
 DemoteLimit: DWORD,
 PromoteLimit: DWORD,
 DemotePercent: BYTE,
 PromotePercent: BYTE,
 Spare: ARRAY(BYTE, 2),
 AllowDemotion: DWORD,
 AllowPromotion: DWORD,
 Reserved: DWORD
});

var PROCESSOR_POWER_POLICY = new StructT('PROCESSOR_POWER_POLICY', {
 Revision: DWORD,
 DynamicThrottle: BYTE,
 Spare: ARRAY(BYTE, 3),
 DisableCStates: DWORD,
 Reserved: DWORD,
 PolicyCount: DWORD,
 Policy: ARRAY(PROCESSOR_POWER_POLICY_INFO, 3)
});

var PROCESSOR_PERFSTATE_POLICY = new StructT('PROCESSOR_PERFSTATE_POLICY', {
 Revision: DWORD,
 MaxThrottle: BYTE,
 MinThrottle: BYTE,
 BusyAdjThreshold: BYTE,
 TimeCheck: DWORD,
 IncreaseTime: DWORD,
 DecreaseTime: DWORD,
 IncreasePercent: DWORD,
 DecreasePercent: DWORD
});

var undefined = new StructT('undefined', {
 NoDomainAccounting: BYTE,
 IncreasePolicy: BYTE,
 DecreasePolicy: BYTE,
 Reserved: BYTE
});

var ADMINISTRATOR_POWER_POLICY = new StructT('ADMINISTRATOR_POWER_POLICY', {
 MinSleep: SYSTEM_POWER_STATE,
 MaxSleep: SYSTEM_POWER_STATE,
 MinVideoTimeout: DWORD,
 MaxVideoTimeout: DWORD,
 MinSpindownTimeout: DWORD,
 MaxSpindownTimeout: DWORD
});

var SYSTEM_POWER_CAPABILITIES = new StructT('SYSTEM_POWER_CAPABILITIES', {
 PowerButtonPresent: BOOLEAN,
 SleepButtonPresent: BOOLEAN,
 LidPresent: BOOLEAN,
 SystemS1: BOOLEAN,
 SystemS2: BOOLEAN,
 SystemS3: BOOLEAN,
 SystemS4: BOOLEAN,
 SystemS5: BOOLEAN,
 HiberFilePresent: BOOLEAN,
 FullWake: BOOLEAN,
 VideoDimPresent: BOOLEAN,
 ApmPresent: BOOLEAN,
 UpsPresent: BOOLEAN,
 ThermalControl: BOOLEAN,
 ProcessorThrottle: BOOLEAN,
 ProcessorMinThrottle: BYTE,
 ProcessorMaxThrottle: BYTE,
 FastSystemS4: BOOLEAN,
 spare2: ARRAY(BYTE, 3),
 DiskSpinDown: BOOLEAN,
 spare3: ARRAY(BYTE, 8),
 SystemBatteriesPresent: BOOLEAN,
 BatteriesAreShortTerm: BOOLEAN,
 BatteryScale: ARRAY(BATTERY_REPORTING_SCALE, 3),
 AcOnLineWake: SYSTEM_POWER_STATE,
 SoftLidWake: SYSTEM_POWER_STATE,
 RtcWake: SYSTEM_POWER_STATE,
 MinDeviceWakeState: SYSTEM_POWER_STATE,
 DefaultLowLatencyWake: SYSTEM_POWER_STATE
});

var SYSTEM_BATTERY_STATE = new StructT('SYSTEM_BATTERY_STATE', {
 AcOnLine: BOOLEAN,
 BatteryPresent: BOOLEAN,
 Charging: BOOLEAN,
 Discharging: BOOLEAN,
 Spare1: ARRAY(BOOLEAN, 4),
 MaxCapacity: DWORD,
 RemainingCapacity: DWORD,
 Rate: DWORD,
 EstimatedTime: DWORD,
 DefaultAlert1: DWORD,
 DefaultAlert2: DWORD
});

var IMAGE_DOS_HEADER = new StructT('IMAGE_DOS_HEADER', {
 e_magic: WORD,
 e_cblp: WORD,
 e_cp: WORD,
 e_crlc: WORD,
 e_cparhdr: WORD,
 e_minalloc: WORD,
 e_maxalloc: WORD,
 e_ss: WORD,
 e_sp: WORD,
 e_csum: WORD,
 e_ip: WORD,
 e_cs: WORD,
 e_lfarlc: WORD,
 e_ovno: WORD,
 e_res: ARRAY(WORD, 4),
 e_oemid: WORD,
 e_oeminfo: WORD,
 e_res2: ARRAY(WORD, 10),
 e_lfanew: LONG
});

var IMAGE_OS2_HEADER = new StructT('IMAGE_OS2_HEADER', {
 ne_magic: WORD,
 ne_ver: CHAR,
 ne_rev: CHAR,
 ne_enttab: WORD,
 ne_cbenttab: WORD,
 ne_crc: LONG,
 ne_flags: WORD,
 ne_autodata: WORD,
 ne_heap: WORD,
 ne_stack: WORD,
 ne_csip: LONG,
 ne_sssp: LONG,
 ne_cseg: WORD,
 ne_cmod: WORD,
 ne_cbnrestab: WORD,
 ne_segtab: WORD,
 ne_rsrctab: WORD,
 ne_restab: WORD,
 ne_modtab: WORD,
 ne_imptab: WORD,
 ne_nrestab: LONG,
 ne_cmovent: WORD,
 ne_align: WORD,
 ne_cres: WORD,
 ne_exetyp: BYTE,
 ne_flagsothers: BYTE,
 ne_pretthunks: WORD,
 ne_psegrefbytes: WORD,
 ne_swaparea: WORD,
 ne_expver: WORD
});

var IMAGE_VXD_HEADER = new StructT('IMAGE_VXD_HEADER', {
 e32_magic: WORD,
 e32_border: BYTE,
 e32_worder: BYTE,
 e32_level: DWORD,
 e32_cpu: WORD,
 e32_os: WORD,
 e32_ver: DWORD,
 e32_mflags: DWORD,
 e32_mpages: DWORD,
 e32_startobj: DWORD,
 e32_eip: DWORD,
 e32_stackobj: DWORD,
 e32_esp: DWORD,
 e32_pagesize: DWORD,
 e32_lastpagesize: DWORD,
 e32_fixupsize: DWORD,
 e32_fixupsum: DWORD,
 e32_ldrsize: DWORD,
 e32_ldrsum: DWORD,
 e32_objtab: DWORD,
 e32_objcnt: DWORD,
 e32_objmap: DWORD,
 e32_itermap: DWORD,
 e32_rsrctab: DWORD,
 e32_rsrccnt: DWORD,
 e32_restab: DWORD,
 e32_enttab: DWORD,
 e32_dirtab: DWORD,
 e32_dircnt: DWORD,
 e32_fpagetab: DWORD,
 e32_frectab: DWORD,
 e32_impmod: DWORD,
 e32_impmodcnt: DWORD,
 e32_impproc: DWORD,
 e32_pagesum: DWORD,
 e32_datapage: DWORD,
 e32_preload: DWORD,
 e32_nrestab: DWORD,
 e32_cbnrestab: DWORD,
 e32_nressum: DWORD,
 e32_autodata: DWORD,
 e32_debuginfo: DWORD,
 e32_debuglen: DWORD,
 e32_instpreload: DWORD,
 e32_instdemand: DWORD,
 e32_heapsize: DWORD,
 e32_res3: ARRAY(BYTE, 12),
 e32_winresoff: DWORD,
 e32_winreslen: DWORD,
 e32_devid: WORD,
 e32_ddkver: WORD
});

var IMAGE_FILE_HEADER = new StructT('IMAGE_FILE_HEADER', {
 Machine: WORD,
 NumberOfSections: WORD,
 TimeDateStamp: DWORD,
 PointerToSymbolTable: DWORD,
 NumberOfSymbols: DWORD,
 SizeOfOptionalHeader: WORD,
 Characteristics: WORD
});

var IMAGE_DATA_DIRECTORY = new StructT('IMAGE_DATA_DIRECTORY', {
 VirtualAddress: DWORD,
 Size: DWORD
});

var IMAGE_OPTIONAL_HEADER = new StructT('IMAGE_OPTIONAL_HEADER', {
 Magic: WORD,
 MajorLinkerVersion: BYTE,
 MinorLinkerVersion: BYTE,
 SizeOfCode: DWORD,
 SizeOfInitializedData: DWORD,
 SizeOfUninitializedData: DWORD,
 AddressOfEntryPoint: DWORD,
 BaseOfCode: DWORD,
 BaseOfData: DWORD,
 ImageBase: DWORD,
 SectionAlignment: DWORD,
 FileAlignment: DWORD,
 MajorOperatingSystemVersion: WORD,
 MinorOperatingSystemVersion: WORD,
 MajorImageVersion: WORD,
 MinorImageVersion: WORD,
 MajorSubsystemVersion: WORD,
 MinorSubsystemVersion: WORD,
 Win32VersionValue: DWORD,
 SizeOfImage: DWORD,
 SizeOfHeaders: DWORD,
 CheckSum: DWORD,
 Subsystem: WORD,
 DllCharacteristics: WORD,
 SizeOfStackReserve: DWORD,
 SizeOfStackCommit: DWORD,
 SizeOfHeapReserve: DWORD,
 SizeOfHeapCommit: DWORD,
 LoaderFlags: DWORD,
 NumberOfRvaAndSizes: DWORD,
 DataDirectory: ARRAY(IMAGE_DATA_DIRECTORY, IMAGE_NUMBEROF_DIRECTORY_ENTRIES)
});

var IMAGE_ROM_OPTIONAL_HEADER = new StructT('IMAGE_ROM_OPTIONAL_HEADER', {
 Magic: WORD,
 MajorLinkerVersion: BYTE,
 MinorLinkerVersion: BYTE,
 SizeOfCode: DWORD,
 SizeOfInitializedData: DWORD,
 SizeOfUninitializedData: DWORD,
 AddressOfEntryPoint: DWORD,
 BaseOfCode: DWORD,
 BaseOfData: DWORD,
 BaseOfBss: DWORD,
 GprMask: DWORD,
 CprMask: ARRAY(DWORD, 4),
 GpValue: DWORD
});

var IMAGE_OPTIONAL_HEADER64 = new StructT('IMAGE_OPTIONAL_HEADER64', {
 Magic: WORD,
 MajorLinkerVersion: BYTE,
 MinorLinkerVersion: BYTE,
 SizeOfCode: DWORD,
 SizeOfInitializedData: DWORD,
 SizeOfUninitializedData: DWORD,
 AddressOfEntryPoint: DWORD,
 BaseOfCode: DWORD,
 ImageBase: ULONGLONG,
 SectionAlignment: DWORD,
 FileAlignment: DWORD,
 MajorOperatingSystemVersion: WORD,
 MinorOperatingSystemVersion: WORD,
 MajorImageVersion: WORD,
 MinorImageVersion: WORD,
 MajorSubsystemVersion: WORD,
 MinorSubsystemVersion: WORD,
 Win32VersionValue: DWORD,
 SizeOfImage: DWORD,
 SizeOfHeaders: DWORD,
 CheckSum: DWORD,
 Subsystem: WORD,
 DllCharacteristics: WORD,
 SizeOfStackReserve: ULONGLONG,
 SizeOfStackCommit: ULONGLONG,
 SizeOfHeapReserve: ULONGLONG,
 SizeOfHeapCommit: ULONGLONG,
 LoaderFlags: DWORD,
 NumberOfRvaAndSizes: DWORD,
 DataDirectory: ARRAY(IMAGE_DATA_DIRECTORY, IMAGE_NUMBEROF_DIRECTORY_ENTRIES)
});

var IMAGE_NT_HEADERS64 = new StructT('IMAGE_NT_HEADERS64', {
 Signature: DWORD,
 FileHeader: IMAGE_FILE_HEADER,
 OptionalHeader: IMAGE_OPTIONAL_HEADER64
});

var IMAGE_NT_HEADERS = new StructT('IMAGE_NT_HEADERS', {
 Signature: DWORD,
 FileHeader: IMAGE_FILE_HEADER,
 OptionalHeader: IMAGE_OPTIONAL_HEADER32
});

var IMAGE_ROM_HEADERS = new StructT('IMAGE_ROM_HEADERS', {
 FileHeader: IMAGE_FILE_HEADER,
 OptionalHeader: IMAGE_ROM_OPTIONAL_HEADER
});

var ANON_OBJECT_HEADER = new StructT('ANON_OBJECT_HEADER', {
 Sig1: WORD,
 Sig2: WORD,
 Version: WORD,
 Machine: WORD,
 TimeDateStamp: DWORD,
 ClassID: CLSID,
 SizeOfData: DWORD
});

var ANON_OBJECT_HEADER_V2 = new StructT('ANON_OBJECT_HEADER_V2', {
 Sig1: WORD,
 Sig2: WORD,
 Version: WORD,
 Machine: WORD,
 TimeDateStamp: DWORD,
 ClassID: CLSID,
 SizeOfData: DWORD,
 Flags: DWORD,
 MetaDataSize: DWORD,
 MetaDataOffset: DWORD
});

var ANON_OBJECT_HEADER_BIGOBJ = new StructT('ANON_OBJECT_HEADER_BIGOBJ', {
 Sig1: WORD,
 Sig2: WORD,
 Version: WORD,
 Machine: WORD,
 TimeDateStamp: DWORD,
 ClassID: CLSID,
 SizeOfData: DWORD,
 Flags: DWORD,
 MetaDataSize: DWORD,
 MetaDataOffset: DWORD,
 NumberOfSections: DWORD,
 PointerToSymbolTable: DWORD,
 NumberOfSymbols: DWORD
});

var IMAGE_SECTION_HEADER = new StructT('IMAGE_SECTION_HEADER', {
 Name: ARRAY(BYTE, IMAGE_SIZEOF_SHORT_NAME),
 Misc: c:winnt.h@366160@S@_IMAGE_SECTION_HEADER@Ua,
 VirtualAddress: DWORD,
 SizeOfRawData: DWORD,
 PointerToRawData: DWORD,
 PointerToRelocations: DWORD,
 PointerToLinenumbers: DWORD,
 NumberOfRelocations: WORD,
 NumberOfLinenumbers: WORD,
 Characteristics: DWORD
});

var IMAGE_SYMBOL = new StructT('IMAGE_SYMBOL', {
 N: c:winnt.h@370553@S@_IMAGE_SYMBOL@Ua,
 Value: DWORD,
 SectionNumber: SHORT,
 Type: WORD,
 StorageClass: BYTE,
 NumberOfAuxSymbols: BYTE
});

var undefined = new StructT('undefined', {
 Short: DWORD,
 Long: DWORD
});

var IMAGE_SYMBOL_EX = new StructT('IMAGE_SYMBOL_EX', {
 N: c:winnt.h@371082@S@_IMAGE_SYMBOL_EX@Ua,
 Value: DWORD,
 SectionNumber: LONG,
 Type: WORD,
 StorageClass: BYTE,
 NumberOfAuxSymbols: BYTE
});

var undefined = new StructT('undefined', {
 Short: DWORD,
 Long: DWORD
});

var IMAGE_AUX_SYMBOL_TOKEN_DEF = new StructT('IMAGE_AUX_SYMBOL_TOKEN_DEF', {
 bAuxType: BYTE,
 bReserved: BYTE,
 SymbolTableIndex: DWORD,
 rgbReserved: ARRAY(BYTE, 12)
});

var undefined = new StructT('undefined', {
 TagIndex: DWORD,
 Misc: c:winnt.h@376762@U@_IMAGE_AUX_SYMBOL@Sa@Ua,
 FcnAry: c:winnt.h@377030@U@_IMAGE_AUX_SYMBOL@Sa@Ua,
 TvIndex: WORD
});

var undefined = new StructT('undefined', {
 Linenumber: WORD,
 Size: WORD
});

var undefined = new StructT('undefined', {
 PointerToLinenumber: DWORD,
 PointerToNextFunction: DWORD
});

var undefined = new StructT('undefined', {
 Dimension: ARRAY(WORD, 4)
});

var undefined = new StructT('undefined', {
 Name: ARRAY(BYTE, IMAGE_SIZEOF_SYMBOL)
});

var undefined = new StructT('undefined', {
 Length: DWORD,
 NumberOfRelocations: WORD,
 NumberOfLinenumbers: WORD,
 CheckSum: DWORD,
 Number: SHORT,
 Selection: BYTE,
 bReserved: BYTE,
 HighNumber: SHORT
});

var undefined = new StructT('undefined', {
 crc: DWORD,
 rgbReserved: ARRAY(BYTE, 14)
});

var undefined = new StructT('undefined', {
 WeakDefaultSymIndex: DWORD,
 WeakSearchType: DWORD,
 rgbReserved: ARRAY(BYTE, 12)
});

var undefined = new StructT('undefined', {
 Name: ARRAY(BYTE, undefined)
});

var undefined = new StructT('undefined', {
 Length: DWORD,
 NumberOfRelocations: WORD,
 NumberOfLinenumbers: WORD,
 CheckSum: DWORD,
 Number: SHORT,
 Selection: BYTE,
 bReserved: BYTE,
 HighNumber: SHORT,
 rgbReserved: ARRAY(BYTE, 2)
});

var undefined = new StructT('undefined', {
 TokenDef: IMAGE_AUX_SYMBOL_TOKEN_DEF,
 rgbReserved: ARRAY(BYTE, 2)
});

var undefined = new StructT('undefined', {
 crc: DWORD,
 rgbReserved: ARRAY(BYTE, 16)
});

var IMAGE_RELOCATION = new StructT('IMAGE_RELOCATION', {
 SymbolTableIndex: DWORD,
 Type: WORD
});

var IMAGE_LINENUMBER = new StructT('IMAGE_LINENUMBER', {
 Type: c:winnt.h@402328@S@_IMAGE_LINENUMBER@Ua,
 Linenumber: WORD
});

var IMAGE_BASE_RELOCATION = new StructT('IMAGE_BASE_RELOCATION', {
 VirtualAddress: DWORD,
 SizeOfBlock: DWORD
});

var IMAGE_ARCHIVE_MEMBER_HEADER = new StructT('IMAGE_ARCHIVE_MEMBER_HEADER', {
 Name: ARRAY(BYTE, 16),
 Date: ARRAY(BYTE, 12),
 UserID: ARRAY(BYTE, 6),
 GroupID: ARRAY(BYTE, 6),
 Mode: ARRAY(BYTE, 8),
 Size: ARRAY(BYTE, 10),
 EndHeader: ARRAY(BYTE, 2)
});

var IMAGE_EXPORT_DIRECTORY = new StructT('IMAGE_EXPORT_DIRECTORY', {
 Characteristics: DWORD,
 TimeDateStamp: DWORD,
 MajorVersion: WORD,
 MinorVersion: WORD,
 Name: DWORD,
 Base: DWORD,
 NumberOfFunctions: DWORD,
 NumberOfNames: DWORD,
 AddressOfFunctions: DWORD,
 AddressOfNames: DWORD,
 AddressOfNameOrdinals: DWORD
});

var IMAGE_IMPORT_BY_NAME = new StructT('IMAGE_IMPORT_BY_NAME', {
 Hint: WORD,
 Name: ARRAY(BYTE, 1)
});

var IMAGE_THUNK_DATA64 = new StructT('IMAGE_THUNK_DATA64', {
 u1: c:winnt.h@405458@S@_IMAGE_THUNK_DATA64@Ua
});

var IMAGE_THUNK_DATA = new StructT('IMAGE_THUNK_DATA', {
 u1: c:winnt.h@405853@S@_IMAGE_THUNK_DATA32@Ua
});

var IMAGE_TLS_DIRECTORY64 = new StructT('IMAGE_TLS_DIRECTORY64', {
 StartAddressOfRawData: ULONGLONG,
 EndAddressOfRawData: ULONGLONG,
 AddressOfIndex: ULONGLONG,
 AddressOfCallBacks: ULONGLONG,
 SizeOfZeroFill: DWORD,
 Characteristics: DWORD
});

var IMAGE_TLS_DIRECTORY = new StructT('IMAGE_TLS_DIRECTORY', {
 StartAddressOfRawData: DWORD,
 EndAddressOfRawData: DWORD,
 AddressOfIndex: DWORD,
 AddressOfCallBacks: DWORD,
 SizeOfZeroFill: DWORD,
 Characteristics: DWORD
});

var IMAGE_IMPORT_DESCRIPTOR = new StructT('IMAGE_IMPORT_DESCRIPTOR', {
 TimeDateStamp: DWORD,
 ForwarderChain: DWORD,
 Name: DWORD,
 FirstThunk: DWORD
});

var IMAGE_BOUND_IMPORT_DESCRIPTOR = new StructT('IMAGE_BOUND_IMPORT_DESCRIPTOR', {
 TimeDateStamp: DWORD,
 OffsetModuleName: WORD,
 NumberOfModuleForwarderRefs: WORD
});

var IMAGE_BOUND_FORWARDER_REF = new StructT('IMAGE_BOUND_FORWARDER_REF', {
 TimeDateStamp: DWORD,
 OffsetModuleName: WORD,
 Reserved: WORD
});

var IMAGE_RESOURCE_DIRECTORY = new StructT('IMAGE_RESOURCE_DIRECTORY', {
 Characteristics: DWORD,
 TimeDateStamp: DWORD,
 MajorVersion: WORD,
 MinorVersion: WORD,
 NumberOfNamedEntries: WORD,
 NumberOfIdEntries: WORD
});


var undefined = new StructT('undefined', {
 NameOffset: DWORD,
 NameIsString: DWORD
});

var undefined = new StructT('undefined', {
 OffsetToDirectory: DWORD,
 DataIsDirectory: DWORD
});

var IMAGE_RESOURCE_DIRECTORY_STRING = new StructT('IMAGE_RESOURCE_DIRECTORY_STRING', {
 Length: WORD,
 NameString: ARRAY(CHAR,  1 )
});

var IMAGE_RESOURCE_DIR_STRING_U = new StructT('IMAGE_RESOURCE_DIR_STRING_U', {
 Length: WORD,
 NameString: ARRAY(WCHAR,  1 )
});

var IMAGE_RESOURCE_DATA_ENTRY = new StructT('IMAGE_RESOURCE_DATA_ENTRY', {
 OffsetToData: DWORD,
 Size: DWORD,
 CodePage: DWORD,
 Reserved: DWORD
});

var IMAGE_LOAD_CONFIG_DIRECTORY = new StructT('IMAGE_LOAD_CONFIG_DIRECTORY', {
 Size: DWORD,
 TimeDateStamp: DWORD,
 MajorVersion: WORD,
 MinorVersion: WORD,
 GlobalFlagsClear: DWORD,
 GlobalFlagsSet: DWORD,
 CriticalSectionDefaultTimeout: DWORD,
 DeCommitFreeBlockThreshold: DWORD,
 DeCommitTotalFreeThreshold: DWORD,
 LockPrefixTable: DWORD,
 MaximumAllocationSize: DWORD,
 VirtualMemoryThreshold: DWORD,
 ProcessHeapFlags: DWORD,
 ProcessAffinityMask: DWORD,
 CSDVersion: WORD,
 Reserved1: WORD,
 EditList: DWORD,
 SecurityCookie: DWORD,
 SEHandlerTable: DWORD,
 SEHandlerCount: DWORD
});

var IMAGE_LOAD_CONFIG_DIRECTORY64 = new StructT('IMAGE_LOAD_CONFIG_DIRECTORY64', {
 Size: DWORD,
 TimeDateStamp: DWORD,
 MajorVersion: WORD,
 MinorVersion: WORD,
 GlobalFlagsClear: DWORD,
 GlobalFlagsSet: DWORD,
 CriticalSectionDefaultTimeout: DWORD,
 DeCommitFreeBlockThreshold: ULONGLONG,
 DeCommitTotalFreeThreshold: ULONGLONG,
 LockPrefixTable: ULONGLONG,
 MaximumAllocationSize: ULONGLONG,
 VirtualMemoryThreshold: ULONGLONG,
 ProcessAffinityMask: ULONGLONG,
 ProcessHeapFlags: DWORD,
 CSDVersion: WORD,
 Reserved1: WORD,
 EditList: ULONGLONG,
 SecurityCookie: ULONGLONG,
 SEHandlerTable: ULONGLONG,
 SEHandlerCount: ULONGLONG
});

var IMAGE_CE_RUNTIME_FUNCTION_ENTRY = new StructT('IMAGE_CE_RUNTIME_FUNCTION_ENTRY', {
 FuncStart: DWORD,
 PrologLen: DWORD,
 FuncLen: DWORD,
 ThirtyTwoBit: DWORD,
 ExceptionFlag: DWORD
});

var IMAGE_ALPHA64_RUNTIME_FUNCTION_ENTRY = new StructT('IMAGE_ALPHA64_RUNTIME_FUNCTION_ENTRY', {
 BeginAddress: ULONGLONG,
 EndAddress: ULONGLONG,
 ExceptionHandler: ULONGLONG,
 HandlerData: ULONGLONG,
 PrologEndAddress: ULONGLONG
});

var IMAGE_ALPHA_RUNTIME_FUNCTION_ENTRY = new StructT('IMAGE_ALPHA_RUNTIME_FUNCTION_ENTRY', {
 BeginAddress: DWORD,
 EndAddress: DWORD,
 ExceptionHandler: DWORD,
 HandlerData: DWORD,
 PrologEndAddress: DWORD
});

var IMAGE_RUNTIME_FUNCTION_ENTRY = new StructT('IMAGE_RUNTIME_FUNCTION_ENTRY', {
 BeginAddress: DWORD,
 EndAddress: DWORD,
 UnwindInfoAddress: DWORD
});

var IMAGE_DEBUG_DIRECTORY = new StructT('IMAGE_DEBUG_DIRECTORY', {
 Characteristics: DWORD,
 TimeDateStamp: DWORD,
 MajorVersion: WORD,
 MinorVersion: WORD,
 Type: DWORD,
 SizeOfData: DWORD,
 AddressOfRawData: DWORD,
 PointerToRawData: DWORD
});

var IMAGE_COFF_SYMBOLS_HEADER = new StructT('IMAGE_COFF_SYMBOLS_HEADER', {
 NumberOfSymbols: DWORD,
 LvaToFirstSymbol: DWORD,
 NumberOfLinenumbers: DWORD,
 LvaToFirstLinenumber: DWORD,
 RvaToFirstByteOfCode: DWORD,
 RvaToLastByteOfCode: DWORD,
 RvaToFirstByteOfData: DWORD,
 RvaToLastByteOfData: DWORD
});

var FPO_DATA = new StructT('FPO_DATA', {
 ulOffStart: DWORD,
 cbProcSize: DWORD,
 cdwLocals: DWORD,
 cdwParams: WORD,
 cbProlog: WORD,
 cbRegs: WORD,
 fHasSEH: WORD,
 fUseBP: WORD,
 reserved: WORD,
 cbFrame: WORD
});

var IMAGE_DEBUG_MISC = new StructT('IMAGE_DEBUG_MISC', {
 DataType: DWORD,
 Length: DWORD,
 Unicode: BOOLEAN,
 Reserved: ARRAY(BYTE,  3 ),
 Data: ARRAY(BYTE,  1 )
});

var IMAGE_FUNCTION_ENTRY = new StructT('IMAGE_FUNCTION_ENTRY', {
 StartingAddress: DWORD,
 EndingAddress: DWORD,
 EndOfPrologue: DWORD
});

var IMAGE_FUNCTION_ENTRY64 = new StructT('IMAGE_FUNCTION_ENTRY64', {
 StartingAddress: ULONGLONG,
 EndingAddress: ULONGLONG
});

var IMAGE_SEPARATE_DEBUG_HEADER = new StructT('IMAGE_SEPARATE_DEBUG_HEADER', {
 Signature: WORD,
 Flags: WORD,
 Machine: WORD,
 Characteristics: WORD,
 TimeDateStamp: DWORD,
 CheckSum: DWORD,
 ImageBase: DWORD,
 SizeOfImage: DWORD,
 NumberOfSections: DWORD,
 ExportedNamesSize: DWORD,
 DebugDirectorySize: DWORD,
 SectionAlignment: DWORD,
 Reserved: ARRAY(DWORD, 2)
});

var NON_PAGED_DEBUG_INFO = new StructT('NON_PAGED_DEBUG_INFO', {
 Signature: WORD,
 Flags: WORD,
 Size: DWORD,
 Machine: WORD,
 Characteristics: WORD,
 TimeDateStamp: DWORD,
 CheckSum: DWORD,
 SizeOfImage: DWORD,
 ImageBase: ULONGLONG
});

var IMAGE_ARCHITECTURE_HEADER = new StructT('IMAGE_ARCHITECTURE_HEADER', {
 AmaskValue: uint,
 '': int,
 AmaskShift: uint,
 FirstEntryRVA: DWORD
});

var IMAGE_ARCHITECTURE_ENTRY = new StructT('IMAGE_ARCHITECTURE_ENTRY', {
 FixupInstRVA: DWORD,
 NewInst: DWORD
});

var IMPORT_OBJECT_HEADER = new StructT('IMPORT_OBJECT_HEADER', {
 Sig1: WORD,
 Sig2: WORD,
 Version: WORD,
 Machine: WORD,
 TimeDateStamp: DWORD,
 SizeOfData: DWORD,
 Type: WORD,
 NameType: WORD,
 Reserved: WORD
});

var IMAGE_COR20_HEADER = new StructT('IMAGE_COR20_HEADER', {
 cb: DWORD,
 MajorRuntimeVersion: WORD,
 MinorRuntimeVersion: WORD,
 MetaData: IMAGE_DATA_DIRECTORY,
 Flags: DWORD,
 Resources: IMAGE_DATA_DIRECTORY,
 StrongNameSignature: IMAGE_DATA_DIRECTORY,
 CodeManagerTable: IMAGE_DATA_DIRECTORY,
 VTableFixups: IMAGE_DATA_DIRECTORY,
 ExportAddressTableJumps: IMAGE_DATA_DIRECTORY,
 ManagedNativeHeader: IMAGE_DATA_DIRECTORY
});

var undefined = new StructT('undefined', {
 Next: SINGLE_LIST_ENTRY,
 Depth: WORD,
 Sequence: WORD
});

var MESSAGE_RESOURCE_ENTRY = new StructT('MESSAGE_RESOURCE_ENTRY', {
 Length: WORD,
 Flags: WORD,
 Text: ARRAY(BYTE,  1 )
});

var MESSAGE_RESOURCE_BLOCK = new StructT('MESSAGE_RESOURCE_BLOCK', {
 LowId: DWORD,
 HighId: DWORD,
 OffsetToEntries: DWORD
});

var MESSAGE_RESOURCE_DATA = new StructT('MESSAGE_RESOURCE_DATA', {
 NumberOfBlocks: DWORD,
 Blocks: ARRAY(MESSAGE_RESOURCE_BLOCK,  1 )
});

var OSVERSIONINFO = new StructT('OSVERSIONINFO', {
 dwOSVersionInfoSize: DWORD,
 dwMajorVersion: DWORD,
 dwMinorVersion: DWORD,
 dwBuildNumber: DWORD,
 dwPlatformId: DWORD,
 szCSDVersion: ARRAY(CHAR,  128 )
});

var RTL_OSVERSIONINFOW = new StructT('RTL_OSVERSIONINFOW', {
 dwOSVersionInfoSize: DWORD,
 dwMajorVersion: DWORD,
 dwMinorVersion: DWORD,
 dwBuildNumber: DWORD,
 dwPlatformId: DWORD,
 szCSDVersion: ARRAY(WCHAR,  128 )
});

var OSVERSIONINFOEX = new StructT('OSVERSIONINFOEX', {
 dwOSVersionInfoSize: DWORD,
 dwMajorVersion: DWORD,
 dwMinorVersion: DWORD,
 dwBuildNumber: DWORD,
 dwPlatformId: DWORD,
 szCSDVersion: ARRAY(CHAR,  128 ),
 wServicePackMajor: WORD,
 wServicePackMinor: WORD,
 wSuiteMask: WORD,
 wProductType: BYTE,
 wReserved: BYTE
});

var RTL_OSVERSIONINFOEXW = new StructT('RTL_OSVERSIONINFOEXW', {
 dwOSVersionInfoSize: DWORD,
 dwMajorVersion: DWORD,
 dwMinorVersion: DWORD,
 dwBuildNumber: DWORD,
 dwPlatformId: DWORD,
 szCSDVersion: ARRAY(WCHAR,  128 ),
 wServicePackMajor: WORD,
 wServicePackMinor: WORD,
 wSuiteMask: WORD,
 wProductType: BYTE,
 wReserved: BYTE
});

var RTL_RESOURCE_DEBUG = new StructT('RTL_RESOURCE_DEBUG', {
 Type: WORD,
 CreatorBackTraceIndex: WORD,
 CriticalSection: _RTL_CRITICAL_SECTION.Δ,
 ProcessLocksList: LIST_ENTRY,
 EntryCount: DWORD,
 ContentionCount: DWORD,
 Flags: DWORD,
 CreatorBackTraceIndexHigh: WORD,
 SpareWORD: WORD
});

var RTL_CRITICAL_SECTION = new StructT('RTL_CRITICAL_SECTION', {
 DebugInfo: PRTL_CRITICAL_SECTION_DEBUG,
 LockCount: LONG,
 RecursionCount: LONG,
 OwningThread: HANDLE,
 LockSemaphore: HANDLE,
 SpinCount: ULONG_PTR
});

var RTL_SRWLOCK = new StructT('RTL_SRWLOCK', {
 Ptr: PVOID
});

var RTL_CONDITION_VARIABLE = new StructT('RTL_CONDITION_VARIABLE', {
 Ptr: PVOID
});

var ACTIVATION_CONTEXT_QUERY_INDEX = new StructT('ACTIVATION_CONTEXT_QUERY_INDEX', {
 ulAssemblyIndex: DWORD,
 ulFileIndexInAssembly: DWORD
});

var ASSEMBLY_FILE_DETAILED_INFORMATION = new StructT('ASSEMBLY_FILE_DETAILED_INFORMATION', {
 ulFlags: DWORD,
 ulFilenameLength: DWORD,
 ulPathLength: DWORD,
 lpFileName: PCWSTR,
 lpFilePath: PCWSTR
});

var ACTIVATION_CONTEXT_ASSEMBLY_DETAILED_INFORMATION = new StructT('ACTIVATION_CONTEXT_ASSEMBLY_DETAILED_INFORMATION', {
 ulFlags: DWORD,
 ulEncodedAssemblyIdentityLength: DWORD,
 ulManifestPathType: DWORD,
 ulManifestPathLength: DWORD,
 liManifestLastWriteTime: LARGE_INTEGER,
 ulPolicyPathType: DWORD,
 ulPolicyPathLength: DWORD,
 liPolicyLastWriteTime: LARGE_INTEGER,
 ulMetadataSatelliteRosterIndex: DWORD,
 ulManifestVersionMajor: DWORD,
 ulManifestVersionMinor: DWORD,
 ulPolicyVersionMajor: DWORD,
 ulPolicyVersionMinor: DWORD,
 ulAssemblyDirectoryNameLength: DWORD,
 lpAssemblyEncodedAssemblyIdentity: PCWSTR,
 lpAssemblyManifestPath: PCWSTR,
 lpAssemblyPolicyPath: PCWSTR,
 lpAssemblyDirectoryName: PCWSTR,
 ulFileCount: DWORD
});

var ACTIVATION_CONTEXT_RUN_LEVEL_INFORMATION = new StructT('ACTIVATION_CONTEXT_RUN_LEVEL_INFORMATION', {
 ulFlags: DWORD,
 RunLevel: ACTCTX_REQUESTED_RUN_LEVEL,
 UiAccess: DWORD
});

var COMPATIBILITY_CONTEXT_ELEMENT = new StructT('COMPATIBILITY_CONTEXT_ELEMENT', {
 Id: GUID,
 Type: ACTCTX_COMPATIBILITY_ELEMENT_TYPE
});

var ACTIVATION_CONTEXT_COMPATIBILITY_INFORMATION = new StructT('ACTIVATION_CONTEXT_COMPATIBILITY_INFORMATION', {
 ElementCount: DWORD,
 Elements: UNEXPOSED
});

var SUPPORTED_OS_INFO = new StructT('SUPPORTED_OS_INFO', {
 OsCount: WORD,
 MitigationExist: WORD,
 OsList: ARRAY(WORD, undefined)
});

var ACTIVATION_CONTEXT_DETAILED_INFORMATION = new StructT('ACTIVATION_CONTEXT_DETAILED_INFORMATION', {
 dwFlags: DWORD,
 ulFormatVersion: DWORD,
 ulAssemblyCount: DWORD,
 ulRootManifestPathType: DWORD,
 ulRootManifestPathChars: DWORD,
 ulRootConfigurationPathType: DWORD,
 ulRootConfigurationPathChars: DWORD,
 ulAppDirPathType: DWORD,
 ulAppDirPathChars: DWORD,
 lpRootManifestPath: PCWSTR,
 lpRootConfigurationPath: PCWSTR,
 lpAppDirPath: PCWSTR
});

var HARDWARE_COUNTER_DATA = new StructT('HARDWARE_COUNTER_DATA', {
 Type: HARDWARE_COUNTER_TYPE,
 Reserved: DWORD,
 Value: DWORD64
});

var PERFORMANCE_DATA = new StructT('PERFORMANCE_DATA', {
 Size: WORD,
 Version: BYTE,
 HwCountersCount: BYTE,
 ContextSwitchCount: DWORD,
 WaitReasonBitMap: DWORD64,
 CycleTime: DWORD64,
 RetryCount: DWORD,
 Reserved: DWORD,
 HwCounters: ARRAY(HARDWARE_COUNTER_DATA, MAX_HW_COUNTERS)
});

var EVENTLOGRECORD = new StructT('EVENTLOGRECORD', {
 Length: DWORD,
 Reserved: DWORD,
 RecordNumber: DWORD,
 TimeGenerated: DWORD,
 TimeWritten: DWORD,
 EventID: DWORD,
 EventType: WORD,
 NumStrings: WORD,
 EventCategory: WORD,
 ReservedFlags: WORD,
 ClosingRecordNumber: DWORD,
 StringOffset: DWORD,
 UserSidLength: DWORD,
 UserSidOffset: DWORD,
 DataLength: DWORD,
 DataOffset: DWORD
});

var _EVENTSFORLOGFILE = new StructT('_EVENTSFORLOGFILE', {
 ulSize: DWORD,
 szLogicalLogFile: ARRAY(WCHAR, MAXLOGICALLOGNAMESIZE),
 ulNumRecords: DWORD,
 pEventLogRecords: UNEXPOSED
});

var _PACKEDEVENTINFO = new StructT('_PACKEDEVENTINFO', {
 ulSize: DWORD,
 ulNumEventsForLogFile: DWORD,
 ulOffsets: UNEXPOSED
});

var TAPE_ERASE = new StructT('TAPE_ERASE', {
 Type: DWORD,
 Immediate: BOOLEAN
});

var TAPE_PREPARE = new StructT('TAPE_PREPARE', {
 Operation: DWORD,
 Immediate: BOOLEAN
});

var TAPE_WRITE_MARKS = new StructT('TAPE_WRITE_MARKS', {
 Type: DWORD,
 Count: DWORD,
 Immediate: BOOLEAN
});

var TAPE_GET_POSITION = new StructT('TAPE_GET_POSITION', {
 Type: DWORD,
 Partition: DWORD,
 Offset: LARGE_INTEGER
});

var TAPE_SET_POSITION = new StructT('TAPE_SET_POSITION', {
 Method: DWORD,
 Partition: DWORD,
 Offset: LARGE_INTEGER,
 Immediate: BOOLEAN
});

var TAPE_GET_DRIVE_PARAMETERS = new StructT('TAPE_GET_DRIVE_PARAMETERS', {
 ECC: BOOLEAN,
 Compression: BOOLEAN,
 DataPadding: BOOLEAN,
 ReportSetmarks: BOOLEAN,
 DefaultBlockSize: DWORD,
 MaximumBlockSize: DWORD,
 MinimumBlockSize: DWORD,
 MaximumPartitionCount: DWORD,
 FeaturesLow: DWORD,
 FeaturesHigh: DWORD,
 EOTWarningZoneSize: DWORD
});

var TAPE_SET_DRIVE_PARAMETERS = new StructT('TAPE_SET_DRIVE_PARAMETERS', {
 ECC: BOOLEAN,
 Compression: BOOLEAN,
 DataPadding: BOOLEAN,
 ReportSetmarks: BOOLEAN,
 EOTWarningZoneSize: DWORD
});

var TAPE_GET_MEDIA_PARAMETERS = new StructT('TAPE_GET_MEDIA_PARAMETERS', {
 Capacity: LARGE_INTEGER,
 Remaining: LARGE_INTEGER,
 BlockSize: DWORD,
 PartitionCount: DWORD,
 WriteProtected: BOOLEAN
});

var TAPE_SET_MEDIA_PARAMETERS = new StructT('TAPE_SET_MEDIA_PARAMETERS', {
 BlockSize: DWORD
});

var TAPE_CREATE_PARTITION = new StructT('TAPE_CREATE_PARTITION', {
 Method: DWORD,
 Count: DWORD,
 Size: DWORD
});

var TAPE_WMI_OPERATIONS = new StructT('TAPE_WMI_OPERATIONS', {
 Method: DWORD,
 DataBufferSize: DWORD,
 DataBuffer: PVOID
});

var TRANSACTION_BASIC_INFORMATION = new StructT('TRANSACTION_BASIC_INFORMATION', {
 TransactionId: GUID,
 State: DWORD,
 Outcome: DWORD
});

var TRANSACTIONMANAGER_BASIC_INFORMATION = new StructT('TRANSACTIONMANAGER_BASIC_INFORMATION', {
 TmIdentity: GUID,
 VirtualClock: LARGE_INTEGER
});

var TRANSACTIONMANAGER_LOG_INFORMATION = new StructT('TRANSACTIONMANAGER_LOG_INFORMATION', {
 LogIdentity: GUID
});

var TRANSACTIONMANAGER_LOGPATH_INFORMATION = new StructT('TRANSACTIONMANAGER_LOGPATH_INFORMATION', {
 LogPathLength: DWORD,
 LogPath: ARRAY(WCHAR, 1)
});

var TRANSACTIONMANAGER_RECOVERY_INFORMATION = new StructT('TRANSACTIONMANAGER_RECOVERY_INFORMATION', {
 LastRecoveredLsn: ULONGLONG
});

var TRANSACTIONMANAGER_OLDEST_INFORMATION = new StructT('TRANSACTIONMANAGER_OLDEST_INFORMATION', {
 OldestTransactionGuid: GUID
});

var TRANSACTION_PROPERTIES_INFORMATION = new StructT('TRANSACTION_PROPERTIES_INFORMATION', {
 IsolationLevel: DWORD,
 IsolationFlags: DWORD,
 Timeout: LARGE_INTEGER,
 Outcome: DWORD,
 DescriptionLength: DWORD,
 Description: ARRAY(WCHAR, 1)
});

var TRANSACTION_BIND_INFORMATION = new StructT('TRANSACTION_BIND_INFORMATION', {
 TmHandle: HANDLE
});

var TRANSACTION_ENLISTMENT_PAIR = new StructT('TRANSACTION_ENLISTMENT_PAIR', {
 EnlistmentId: GUID,
 ResourceManagerId: GUID
});

var TRANSACTION_ENLISTMENTS_INFORMATION = new StructT('TRANSACTION_ENLISTMENTS_INFORMATION', {
 NumberOfEnlistments: DWORD,
 EnlistmentPair: ARRAY(TRANSACTION_ENLISTMENT_PAIR, 1)
});

var TRANSACTION_SUPERIOR_ENLISTMENT_INFORMATION = new StructT('TRANSACTION_SUPERIOR_ENLISTMENT_INFORMATION', {
 SuperiorEnlistmentPair: TRANSACTION_ENLISTMENT_PAIR
});

var RESOURCEMANAGER_BASIC_INFORMATION = new StructT('RESOURCEMANAGER_BASIC_INFORMATION', {
 ResourceManagerId: GUID,
 DescriptionLength: DWORD,
 Description: ARRAY(WCHAR, 1)
});

var RESOURCEMANAGER_COMPLETION_INFORMATION = new StructT('RESOURCEMANAGER_COMPLETION_INFORMATION', {
 IoCompletionPortHandle: HANDLE,
 CompletionKey: ULONG_PTR
});

var ENLISTMENT_BASIC_INFORMATION = new StructT('ENLISTMENT_BASIC_INFORMATION', {
 EnlistmentId: GUID,
 TransactionId: GUID,
 ResourceManagerId: GUID
});

var ENLISTMENT_CRM_INFORMATION = new StructT('ENLISTMENT_CRM_INFORMATION', {
 CrmTransactionManagerId: GUID,
 CrmResourceManagerId: GUID,
 CrmEnlistmentId: GUID
});

var TRANSACTION_LIST_ENTRY = new StructT('TRANSACTION_LIST_ENTRY', {
 UOW: UOW
});

var TRANSACTION_LIST_INFORMATION = new StructT('TRANSACTION_LIST_INFORMATION', {
 NumberOfTransactions: DWORD,
 TransactionInformation: ARRAY(TRANSACTION_LIST_ENTRY, 1)
});

var KTMOBJECT_CURSOR = new StructT('KTMOBJECT_CURSOR', {
 LastQuery: GUID,
 ObjectIdCount: DWORD,
 ObjectIds: ARRAY(GUID, 1)
});



var TP_POOL_STACK_INFORMATION = new StructT('TP_POOL_STACK_INFORMATION', {
 StackReserve: SIZE_T,
 StackCommit: SIZE_T
});


var TP_CALLBACK_ENVIRON = new StructT('TP_CALLBACK_ENVIRON', {
 Version: TP_VERSION,
 Pool: PTP_POOL,
 CleanupGroup: PTP_CLEANUP_GROUP,
 CleanupGroupCancelCallback: PTP_CLEANUP_GROUP_CANCEL_CALLBACK,
 RaceDll: PVOID,
 ActivationContext: _ACTIVATION_CONTEXT.Δ,
 FinalizationCallback: PTP_SIMPLE_CALLBACK,
 u: c:winnt.h@495534@S@_TP_CALLBACK_ENVIRON_V3@Ua,
 CallbackPriority: TP_CALLBACK_PRIORITY,
 Size: DWORD
});


var undefined = new StructT('undefined', {
 LongFunction: DWORD,
 Persistent: DWORD,
 Private: DWORD
});






  Int64ShllMod32: [ ULONGLONG, { Value: ULONGLONG, ShiftCount: DWORD } ],
  Int64ShraMod32: [ LONGLONG, { Value: LONGLONG, ShiftCount: DWORD } ],
  Int64ShrlMod32: [ ULONGLONG, { Value: ULONGLONG, ShiftCount: DWORD } ],
  _rotl: [ _void, { Value: uint, Shift: int } ],
  _rotl64: [ _void, { Value: ulonglong, Shift: int } ],
  _rotr: [ _void, { Value: uint, Shift: int } ],
  _rotr64: [ _void, { Value: ulonglong, Shift: int } ],
  InterlockedBitTestAndSet: [ BOOLEAN, { Base: LONG.Δ, Bit: LONG } ],
  InterlockedBitTestAndReset: [ BOOLEAN, { Base: LONG.Δ, Bit: LONG } ],
  InterlockedBitTestAndComplement: [ BOOLEAN, { Base: LONG.Δ, Bit: LONG } ],
  MemoryBarrier: [ _void, {  } ],
  ReadPMC: [ DWORD64, { Counter: DWORD } ],
  ReadTimeStampCounter: [ DWORD64, {  } ],
  DbgRaiseAssertionFailure: [ _void, {  } ],
  GetFiberData: [ PVOID, {  } ],
  GetCurrentFiber: [ PVOID, {  } ],
  RtlUnwind: [ _void, { TargetFrame: PVOID, TargetIp: PVOID, ExceptionRecord: PEXCEPTION_RECORD, ReturnValue: PVOID } ],
  RtlInitializeSListHead: [ _void, { ListHead: PSLIST_HEADER } ],
  RtlFirstEntrySList: [ PSINGLE_LIST_ENTRY, { ListHead: SLIST_HEADER.Δ } ],
  RtlInterlockedPopEntrySList: [ PSINGLE_LIST_ENTRY, { ListHead: PSLIST_HEADER } ],
  RtlInterlockedPushEntrySList: [ PSINGLE_LIST_ENTRY, { ListHead: PSLIST_HEADER, ListEntry: PSINGLE_LIST_ENTRY } ],
  RtlInterlockedFlushSList: [ PSINGLE_LIST_ENTRY, { ListHead: PSLIST_HEADER } ],
  RtlQueryDepthSList: [ WORD, { ListHead: PSLIST_HEADER } ],
  RtlRunOnceInitialize: [ _void, { RunOnce: PRTL_RUN_ONCE } ],
  RtlRunOnceExecuteOnce: [ DWORD, { RunOnce: PRTL_RUN_ONCE, InitFn: PRTL_RUN_ONCE_INIT_FN, Parameter: PVOID, Context: PVOID.Δ } ],
  RtlRunOnceBeginInitialize: [ DWORD, { RunOnce: PRTL_RUN_ONCE, Flags: DWORD, Context: PVOID.Δ } ],
  RtlRunOnceComplete: [ DWORD, { RunOnce: PRTL_RUN_ONCE, Flags: DWORD, Context: PVOID } ],
  HEAP_MAKE_TAG_FLAGS: [ DWORD, { TagBase: DWORD, Tag: DWORD } ],
  RtlCaptureStackBackTrace: [ WORD, { FramesToSkip: DWORD, FramesToCapture: DWORD, BackTrace: PVOID.Δ, BackTraceHash: PDWORD } ],
  RtlCaptureContext: [ _void, { ContextRecord: PCONTEXT } ],
  RtlCompareMemory: [ SIZE_T, { Source1: _void.Δ, Source2: _void.Δ, Length: SIZE_T } ],
  RtlSecureZeroMemory: [ PVOID, { ptr: PVOID, cnt: SIZE_T } ],
  RtlPcToFileHeader: [ PVOID, { PcValue: PVOID, BaseOfImage: PVOID.Δ } ],
  VerSetConditionMask: [ ULONGLONG, { ConditionMask: ULONGLONG, TypeMask: DWORD, Condition: BYTE } ],
  RtlGetProductInfo: [ BOOLEAN, { OSMajorVersion: DWORD, OSMinorVersion: DWORD, SpMajorVersion: DWORD, SpMinorVersion: DWORD, ReturnedProductType: PDWORD } ],
  RtlCopyExtendedContext: [ DWORD, { Destination: PCONTEXT_EX, ContextFlags: DWORD, Source: PCONTEXT_EX } ],
  RtlInitializeExtendedContext: [ DWORD, { Context: PVOID, ContextFlags: DWORD, ContextEx: PCONTEXT_EX.Δ } ],
  RtlGetEnabledExtendedFeatures: [ DWORD64, { FeatureMask: DWORD64 } ],
  RtlGetExtendedContextLength: [ DWORD, { ContextFlags: DWORD, ContextLength: PDWORD } ],
  RtlGetExtendedFeaturesMask: [ DWORD64, { ContextEx: PCONTEXT_EX } ],
  RtlLocateExtendedFeature: [ PVOID, { ContextEx: PCONTEXT_EX, FeatureId: DWORD, Length: PDWORD } ],
  RtlLocateLegacyContext: [ PCONTEXT, { ContextEx: PCONTEXT_EX, Length: PDWORD } ],
  RtlSetExtendedFeaturesMask: [ _void, { ContextEx: PCONTEXT_EX, FeatureMask: DWORD64 } ],
  TpInitializeCallbackEnviron: [ _void, { CallbackEnviron: PTP_CALLBACK_ENVIRON } ],
  TpSetCallbackThreadpool: [ _void, { CallbackEnviron: PTP_CALLBACK_ENVIRON, Pool: PTP_POOL } ],
  TpSetCallbackCleanupGroup: [ _void, { CallbackEnviron: PTP_CALLBACK_ENVIRON, CleanupGroup: PTP_CLEANUP_GROUP, CleanupGroupCancelCallback: PTP_CLEANUP_GROUP_CANCEL_CALLBACK } ],
  TpSetCallbackActivationContext: [ _void, { CallbackEnviron: PTP_CALLBACK_ENVIRON, ActivationContext: _ACTIVATION_CONTEXT.Δ } ],
  TpSetCallbackNoActivationContext: [ _void, { CallbackEnviron: PTP_CALLBACK_ENVIRON } ],
  TpSetCallbackLongFunction: [ _void, { CallbackEnviron: PTP_CALLBACK_ENVIRON } ],
  TpSetCallbackRaceWithDll: [ _void, { CallbackEnviron: PTP_CALLBACK_ENVIRON, DllHandle: PVOID } ],
  TpSetCallbackFinalizationCallback: [ _void, { CallbackEnviron: PTP_CALLBACK_ENVIRON, FinalizationCallback: PTP_SIMPLE_CALLBACK } ],
  TpSetCallbackPriority: [ _void, { CallbackEnviron: PTP_CALLBACK_ENVIRON, Priority: TP_CALLBACK_PRIORITY } ],
  TpSetCallbackPersistent: [ _void, { CallbackEnviron: PTP_CALLBACK_ENVIRON } ],
  TpDestroyCallbackEnviron: [ _void, { CallbackEnviron: PTP_CALLBACK_ENVIRON } ],
  NtCurrentTeb: [ struct _TEB, {  } ],
