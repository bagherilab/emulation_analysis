import os
import boto3


def download_dir(
    bucket: str, object_path: str, file_prefix: str, output_path: str
) -> None:
    """
    Downloads all files from a given s3 bucket.
    Pulls object keys in limited size sets for cases of buckets with 1000+ objects.

    Parameters
    ----------
    bucket : string
        Bucket to download from
    object_path : string
        Name to store object under in bucket
    file_prefix : string
        Prefix to match on s3 of files to be dowloaded
    output_path : string
        Path to directory where files should be saved
    """
    s3_client = boto3.client("s3")

    keys = []
    next_token = ""
    kwargs_template = {
        "Bucket": bucket,
        "Prefix": (object_path + file_prefix),
    }
    while next_token is not None:
        kwargs = kwargs_template.copy()
        if next_token != "":
            kwargs.update({"ContinuationToken": next_token})
        results = s3_client.list_objects(**kwargs)
        contents = results.get("Contents")
        for content in contents:
            key = content.get("Key")
            keys.append(key)
        next_token = results.get("NextContinuationToken")
    # Make the output directory if it doesn't already exist
    if not os.path.exists(os.path.dirname(output_path)):
        os.makedirs(os.path.dirname(output_path))
    for k in keys:
        _, extracted_file_name = os.path.split(k)
        full_out_path = output_path + extracted_file_name
        s3_client.download_file(bucket, k, full_out_path)
    print(f"Data from {object_path} successfully downloaded")


def download_file(bucket: str, object_path: str, file_name: str) -> None:
    """
    Downloads a file from a given s3 bucket.

    Parameters
    ----------
    bucket : string
        Bucket to download from
    object_path : string
        Full name of file including object path
    file_name: string
        Name to save file as locally

    """
    s3_client = boto3.client("s3")
    try:
        s3_client.download_file(bucket, object_path, file_name)
    except:
        print(f"Could not download {object_path}")
        raise

    print(f"Data from {object_path} successfully downloaded")


def upload_file(file_name: str, bucket: str, object_name: str) -> bool:
    """
    Uploads a local file to an s3 bucket

    Parameters
    ----------
    file_name : string
        File to upload to s3
    bucket : string
        Bucket to upload to
    object_name : string
        Name to store object under in bucket

    Returns
    -------
    boolean
        True on success of upload

    """
    # Establish s3 client
    s3_client = boto3.client("s3")
    response = s3_client.upload_file(file_name, bucket, object_name)

    return response


def list_s3_files(bucket: str, prefix: str) -> list[str]:
    """
    Lists all files (without downloading) in an s3 object, including all files in nested objects

    Parameters
    ----------
    bucket : string
        Bucket to list from
    object_name : string
        Name to list from

    Returns
    -------
    file_list
        List of all files (objects) from specified location

    """
    s3_resource = boto3.resource("s3")
    file_list = []
    my_bucket = s3_resource.Bucket(bucket)
    for object_summary in my_bucket.objects.filter(Prefix=prefix):
        file_name = object_summary.key.split("/")[-1]
        file_list.append(file_name)
    return file_list


def get_data_files(
    bucket: str, object_prefix: str, include: list[str] = [], exclude: list[str] = []
) -> list[str]:
    """
    Lists all files (without downloading) in an s3 object, including all files in nested objects

    Parameters
    ----------
    bucket :
        Bucket to list from
    object_name :
        Name to list from
    exclude :
        List of substrings on which to filter returned list

    Returns
    -------
    file_list
        List of all files (objects) from specified location

    """
    files_list = list_s3_files(bucket, object_prefix)

    if exclude:
        for exclude_term in exclude:
            files_list = list(filter(lambda file: exclude_term not in file, files_list))

    if include:
        final_list = []
        for include_term in include:
            final_list += list(filter(lambda file: include_term in file, files_list))
        return final_list
    return files_list
