namespace AntShares.Core
{
    export interface ISignable extends IO.ISerializable
    {
        // ������֤�ö���Ľű��б�
        scripts: Core.Scripts.Script[];

        deserializeUnsigned(reader: IO.BinaryReader): void;
        getScriptHashesForVerifying(): PromiseLike<Uint160[]>;
        serializeUnsigned(writer: IO.BinaryWriter): void;
    }
}
